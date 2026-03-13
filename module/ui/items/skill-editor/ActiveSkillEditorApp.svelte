<script lang="ts">
    import { onDestroy } from "svelte";
    import { localize } from "../../../services/utilities";
    import { StoreManager } from "../../../utilities/StoreManager.svelte";
    import type { IStoreManager } from "../../../utilities/IStoreManager";
    import { SkillSpendingService } from "../../../services/character-creation/SkillSpendingService";
    import type { SkillCategory } from "../../../services/character-creation/SkillSpendingService";
    import Image from "../../common-components/Image.svelte";
    import ItemSheetWrapper from "../../common-components/ItemSheetWrapper.svelte";
    import ItemSheetComponent from "../../common-components/ItemSheetComponent.svelte";
    import SpecializationCard from "./SpecializationCard.svelte";

    let { actor, skill, app }: { actor: Actor; skill: Item; app: any } = $props();

    const SKILL_CATEGORY: SkillCategory = "active";
    const spendingService = SkillSpendingService.Instance();

    // ─── StoreManager setup ───────────────────────────────────────────────────

    const storeManager = StoreManager.Instance as IStoreManager;
    storeManager.Subscribe(actor);
    storeManager.Subscribe(skill);

    // ─── Stores ───────────────────────────────────────────────────────────────

    const isCreation = storeManager.GetFlagStore<boolean>(actor, "isCharacterCreation", false);
    const valueStore = storeManager.GetRWStore<number>(skill, "activeSkill.value");
    const specializationsStore = storeManager.GetRWStore<Array<{ name: string; value: number }>>(
        skill,
        "activeSkill.specializations"
    );

    // ─── Linked attribute rating (computed once — attrs locked during skill phase) ──────────────────────────────

    const linkedAttribute = (skill.system as Record<string, any>).activeSkill.linkedAttribute as string;
    const attrs = (actor.system as Record<string, any>)?.attributes ?? {};
    const linkedAttrRating =
        Number(attrs[linkedAttribute]?.value ?? 0) + Number(attrs[linkedAttribute]?.modifier ?? 0);

    // ─── Derived state ────────────────────────────────────────────────────────

    const disableValueControls = $derived($isCreation && $specializationsStore.length > 0);

    // ─── Commit trigger exposure ──────────────────────────────────────────────

    $effect(() => {
        if (app) {
            app.requestCommit = () => { /* Phase 3: karma commit hook */ };
        }
    });

    // ─── Increment / Decrement ────────────────────────────────────────────────

    function increment(): void {
        if (!$isCreation) return; // Phase 3: karma shopping
        if (!spendingService.canIncrease(actor, skill, SKILL_CATEGORY, linkedAttrRating)) return;
        spendingService.increase(actor, skill, SKILL_CATEGORY, linkedAttrRating);
    }

    function decrement(): void {
        if (!$isCreation) return; // Phase 3: karma shopping
        if (!spendingService.canDecrease(actor, skill, SKILL_CATEGORY)) return;
        spendingService.decrease(actor, skill, SKILL_CATEGORY, linkedAttrRating);
    }

    // ─── Specializations ──────────────────────────────────────────────────────

    function addSpecialization(): void {
        if (!$isCreation) return;
        if ($specializationsStore.length > 0) {
            ui.notifications?.info(localize(CONFIG.SR3E.SKILL?.onlyonespecializationatcreation ?? "sr3e.skill.onlyonespecializationatcreation"));
            return;
        }
        if ($valueStore <= 1) return;
        const newSpec = {
            name: localize(CONFIG.SR3E.SKILL?.newspecialization ?? "SR3E.skill.newspecialization"),
            value: $valueStore + 1,
        };
        $valueStore -= 1;
        $specializationsStore = [...$specializationsStore, newSpec];
    }

    function deleteSpecialization(spec: { name: string; value: number }): void {
        $specializationsStore = $specializationsStore.filter((s) => s !== spec);
        if ($isCreation) $valueStore += 1;
    }

    // ─── Delete skill ─────────────────────────────────────────────────────────

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
                await actor.deleteEmbeddedDocuments("Item", [skill.id!]);
            }
            app?.close();
        }
    }

    // ─── Cleanup ──────────────────────────────────────────────────────────────

    onDestroy(() => {
        storeManager.Unsubscribe(actor);
        storeManager.Unsubscribe(skill);
        if (app?.requestCommit) {
            try { delete app.requestCommit; } catch { app.requestCommit = undefined; }
        }
    });
</script>

<ItemSheetWrapper csslayout="single">

    <!-- Image -->
    <ItemSheetComponent>
        <Image entity={skill} />
    </ItemSheetComponent>

    <!-- Skill HUD panel -->
    <ItemSheetComponent>
        <div class="skill-hud-panel">

            <!-- Title + value on one line -->
            <div class="skill-hud-display">
                <div class="skill-hud-title-row">
                    <h2 class="skill-hud-name no-margin">{skill.name}</h2>
                    <h2 class="skill-hud-value-badge no-margin">{$valueStore}</h2>
                </div>
            </div>

            <!-- Controls: − + 🗑 -->
            <div class="skill-hud-controls">
                <button
                    type="button"
                    class="skill-hud-btn"
                    aria-label="Decrease skill"
                    onclick={decrement}
                    disabled={disableValueControls}
                ><i class="fa-solid fa-minus"></i></button>
                <button
                    type="button"
                    class="skill-hud-btn"
                    aria-label="Increase skill"
                    onclick={increment}
                    disabled={disableValueControls}
                ><i class="fa-solid fa-plus"></i></button>
                <button
                    type="button"
                    class="skill-hud-btn danger"
                    aria-label="Delete skill"
                    onclick={deleteSkill}
                ><i class="fa-solid fa-trash-can"></i></button>
            </div>

            <!-- Add specialization -->
            <button
                type="button"
                class="skill-add-spec-btn"
                aria-label="Add specialization"
                onclick={addSpecialization}
                disabled={$valueStore <= 1 || $specializationsStore.length > 0}
            >
                {localize(CONFIG.SR3E.SKILL?.specialize ?? "sr3e.skill.specialize")}
            </button>

        </div>
    </ItemSheetComponent>

    <!-- Specializations -->
    {#if $specializationsStore.length > 0}
        <ItemSheetComponent>
            <div class="skill-hud-spec-header">
                <span>{localize(CONFIG.SR3E.SKILL?.specializations ?? "SR3E.skill.specializations")}</span>
            </div>
            <div class="skill-hud-spec-list">
                {#each $specializationsStore as _spec, i}
                    <SpecializationCard
                        bind:specialization={$specializationsStore[i]!}
                        {actor}
                        {skill}
                        isCreationMode={$isCreation}
                        ondelete={deleteSpecialization}
                        onchange={() => { $specializationsStore = [...$specializationsStore]; }}
                    />
                {/each}
            </div>
        </ItemSheetComponent>
    {/if}

</ItemSheetWrapper>
