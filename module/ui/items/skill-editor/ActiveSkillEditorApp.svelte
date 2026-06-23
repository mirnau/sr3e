<script lang="ts">
    import { onDestroy, onMount, untrack } from "svelte";
    import { derived, get } from "svelte/store";
    import { localize } from "../../../services/utilities";
    import { StoreManager } from "../../../utilities/StoreManager.svelte";
    import type { IStoreManager } from "../../../utilities/IStoreManager";
    import { SkillSpendingService } from "../../../services/character-creation/SkillSpendingService";
    import type { SkillCategory } from "../../../services/character-creation/SkillSpendingService";
    import { KarmaSpendingService } from "../../../services/karma/KarmaSpendingService";
    import Image from "../../common-components/Image.svelte";
    import ItemSheetWrapper from "../../common-components/ItemSheetWrapper.svelte";
    import ItemSheetComponent from "../../common-components/ItemSheetComponent.svelte";
    import SpecializationCard from "./SpecializationCard.svelte";

    let { actor: _actor, skill: _skill, app }: { actor: Actor; skill: Item; app: any } = $props();
    const actor = untrack(() => _actor);
    const skill = untrack(() => _skill);

    const SKILL_CATEGORY: SkillCategory = "active";
    const IS_ACTIVE = true;
    const spendingService = SkillSpendingService.Instance();
    const karmaService = KarmaSpendingService.Instance();

    const storeManager = StoreManager.Instance as IStoreManager;
    storeManager.Subscribe(actor);
    storeManager.Subscribe(skill);

    const isCreation = storeManager.GetFlagStore<boolean>(actor, "isCharacterCreation", false);
    const isShoppingState = storeManager.GetFlagStore<boolean>(actor, "isShoppingState", false);
    const isKarmaMode = derived([isShoppingState, isCreation], ([$s, $c]) => $s && !$c);

    const valueStore = storeManager.GetRWStore<number>(skill, "activeSkill.value");
    const specializationsStore = storeManager.GetRWStore<Array<{ name: string; value: number }>>(skill, "activeSkill.specializations");
    const goodKarmaStore = storeManager.GetRWStore<number>(actor, "karma.goodKarma");
    const attrKarmaSession = storeManager.GetShallowStore<{ active: boolean; stagedSpent: number }>(actor, "shoppingKarmaSession", { active: false, stagedSpent: 0 });
    const skillKarmaRegistry = storeManager.GetShallowStore<Record<string, { stagedSpent: number; snapshot: { value: number } }>>(actor, "skillKarmaRegistry", {});

    const linkedAttribute = (skill.system as Record<string, any>).activeSkill.linkedAttribute as string;
    const attrs = (actor.system as Record<string, any>)?.attributes ?? {};
    const linkedAttrRating = Number(attrs[linkedAttribute]?.value ?? 0) + Number(attrs[linkedAttribute]?.modifier ?? 0);

    const remainingKarma = $derived(
        ($goodKarmaStore ?? 0)
        - ($attrKarmaSession?.active ? ($attrKarmaSession.stagedSpent ?? 0) : 0)
        - Object.values($skillKarmaRegistry ?? {}).reduce((sum: number, s: any) => sum + (s.stagedSpent ?? 0), 0)
    );
    const snapshotValue = $derived($skillKarmaRegistry[skill.id!]?.snapshot.value ?? $valueStore);
    const sessionCost = $derived($skillKarmaRegistry[skill.id!]?.stagedSpent ?? 0);
    const canIncrSkill = $derived($isKarmaMode && remainingKarma >= karmaService.calcSkillCost($valueStore + 1, linkedAttrRating, IS_ACTIVE));
    const canDecrSkill = $derived(
        $isKarmaMode &&
        $valueStore > snapshotValue &&
        $specializationsStore.length <= ($skillKarmaRegistry[skill.id!]?.snapshot.specializations.length ?? $specializationsStore.length)
    );
    const canAddSpecKarma = $derived(
        $specializationsStore.length < $valueStore &&
        remainingKarma >= karmaService.calcSpecCost($valueStore + 1, linkedAttrRating, IS_ACTIVE)
    );
    const specIncrDisabled = $derived($specializationsStore.map(spec => {
        if (!$isKarmaMode) return false;
        const ceiling = $valueStore === 1 ? 3 : $valueStore * 2;
        if (spec.value + 1 > ceiling) return true;
        return remainingKarma < karmaService.calcSpecCost(spec.value + 1, linkedAttrRating, IS_ACTIVE);
    }));

    const disableValueControls = $derived($isCreation && $specializationsStore.length > 0);

    onMount(() => {
        if (get(isKarmaMode)) karmaService.startSkillSession(actor, skill);
    });

    $effect(() => {
        if (app) {
            app.requestCommit = () => {
                if (get(isKarmaMode)) karmaService.commitSkillSession(actor, skill.id!);
            };
        }
    });

    function increment(): void {
        if (get(isKarmaMode)) {
            if (!karmaService.canStageSkillIncrement(actor, skill, linkedAttrRating, IS_ACTIVE)) return;
            karmaService.stageSkillIncrement(actor, skill, linkedAttrRating, IS_ACTIVE);
            return;
        }
        if (!$isCreation) return;
        if (!spendingService.canIncrease(actor, skill, SKILL_CATEGORY, linkedAttrRating)) return;
        spendingService.increase(actor, skill, SKILL_CATEGORY, linkedAttrRating);
    }

    function decrement(): void {
        if (get(isKarmaMode)) {
            if (!karmaService.canStageSkillDecrement(actor, skill)) return;
            karmaService.stageSkillDecrement(actor, skill, linkedAttrRating, IS_ACTIVE);
            return;
        }
        if (!$isCreation) return;
        if (!spendingService.canDecrease(actor, skill, SKILL_CATEGORY)) return;
        spendingService.decrease(actor, skill, SKILL_CATEGORY, linkedAttrRating);
    }

    function addSpecialization(): void {
        if (get(isKarmaMode)) {
            if (!karmaService.canAddSpec(actor, skill, linkedAttrRating, IS_ACTIVE)) return;
            karmaService.stageSpecAdd(actor, skill, localize(CONFIG.SR3E.SKILL?.newspecialization), linkedAttrRating, IS_ACTIVE);
            return;
        }
        if (!$isCreation) return;
        if ($specializationsStore.length > 0) {
            ui.notifications?.info(localize(CONFIG.SR3E.SKILL?.onlyonespecializationatcreation));
            return;
        }
        if ($valueStore <= 1) return;
        const newSpec = { name: localize(CONFIG.SR3E.SKILL?.newspecialization), value: $valueStore + 1 };
        $valueStore -= 1;
        $specializationsStore = [...$specializationsStore, newSpec];
    }

    function deleteSpecialization(spec: { name: string; value: number }): void {
        if (get(isKarmaMode)) {
            const specIndex = $specializationsStore.indexOf(spec);
            if (specIndex < 0) return;
            karmaService.stageSpecDelete(actor, skill, specIndex, linkedAttrRating, IS_ACTIVE);
            return;
        }
        $specializationsStore = $specializationsStore.filter((s) => s !== spec);
        if ($isCreation) $valueStore += 1;
    }

    function handleSpecIncrement(specIndex: number): void {
        if (!karmaService.canStageSpecIncrement(actor, skill, specIndex, linkedAttrRating, IS_ACTIVE)) return;
        karmaService.stageSpecIncrement(actor, skill, specIndex, linkedAttrRating, IS_ACTIVE);
    }

    async function deleteSkill(): Promise<void> {
        const confirmed = await foundry.applications.api.DialogV2.confirm({
            window: { title: localize(CONFIG.SR3E.MODAL.deleteskilltitle) },
            content: localize(CONFIG.SR3E.MODAL.deleteskill),
            yes: { label: localize(CONFIG.SR3E.MODAL.confirm), default: true },
            no: { label: localize(CONFIG.SR3E.MODAL.decline) },
            modal: true,
            rejectClose: true,
        });
        if (confirmed) {
            if ($isCreation) {
                await spendingService.deleteWithRefund(actor, skill, SKILL_CATEGORY, linkedAttrRating);
                ui.notifications?.info(localize("SR3E.notifications.skillpointsrefund"));
            } else {
                if (get(isKarmaMode)) karmaService.cancelSkillSession(actor, skill);
                await actor.deleteEmbeddedDocuments("Item", [skill.id!]);
            }
            app?.close();
        }
    }

    onDestroy(() => {
        karmaService.cancelSkillSession(actor, skill);
        storeManager.Unsubscribe(actor);
        storeManager.Unsubscribe(skill);
        if (app?.requestCommit) {
            try { delete app.requestCommit; } catch { app.requestCommit = undefined; }
        }
    });
</script>

<ItemSheetWrapper csslayout="single">
<ItemSheetComponent>
        <Image entity={skill} />
    </ItemSheetComponent>
<ItemSheetComponent>
        <div class="skill-hud-panel">
<div class="skill-hud-display">
                <div class="skill-hud-title-row">
                    <h2 class="skill-hud-name no-margin">{skill.name}</h2>
                    <h2 class="skill-hud-value-badge no-margin">{$valueStore}</h2>
                </div>
                {#if $isKarmaMode && sessionCost > 0}
                    <div class="skill-hud-title-row">
                        <h4 class="no-margin">Good Karma</h4>
                        <h4 class="no-margin">−{sessionCost}</h4>
                    </div>
                {/if}
            </div>
<div class="skill-hud-controls">
                <button
                    type="button"
                    class="skill-hud-btn"
                    aria-label="Decrease skill"
                    onclick={decrement}
                    disabled={$isKarmaMode ? !canDecrSkill : disableValueControls}
                ><i class="fa-solid fa-minus"></i></button>
                <button
                    type="button"
                    class="skill-hud-btn"
                    aria-label="Increase skill"
                    onclick={increment}
                    disabled={$isKarmaMode ? !canIncrSkill : disableValueControls}
                ><i class="fa-solid fa-plus"></i></button>
                <button
                    type="button"
                    class="skill-hud-btn"
                    aria-label="Add specialization"
                    onclick={addSpecialization}
                    disabled={$isKarmaMode
                        ? !canAddSpecKarma
                        : ($valueStore <= 1 || $specializationsStore.length > 0)}
                ><i class="fa-solid fa-code-fork"></i></button>
                <button
                    type="button"
                    class="skill-hud-btn danger"
                    aria-label="Delete skill"
                    onclick={deleteSkill}
                ><i class="fa-solid fa-trash-can"></i></button>
            </div>
        </div>
    </ItemSheetComponent>
{#if $specializationsStore.length > 0}
        <ItemSheetComponent>
            <div class="skill-hud-spec-header">
                <span>{localize(CONFIG.SR3E.SKILL?.specializations)}</span>
            </div>
            <div class="skill-hud-spec-list">
                {#each $specializationsStore as _spec, i}
                    <SpecializationCard
                        bind:specialization={$specializationsStore[i]!}
                        {actor}
                        {skill}
                        isCreationMode={$isCreation}
                        isKarmaMode={$isKarmaMode}
                        isDeletable={$isKarmaMode && karmaService.canDeleteSessionSpec(actor, skill, i)}
                        isIncrementDisabled={specIncrDisabled[i] ?? false}
                        ondelete={deleteSpecialization}
                        onchange={() => { $specializationsStore = [...$specializationsStore]; }}
                        onincrement={$isKarmaMode ? () => handleSpecIncrement(i) : undefined}
                    />
                {/each}
            </div>
        </ItemSheetComponent>
    {/if}

</ItemSheetWrapper>
