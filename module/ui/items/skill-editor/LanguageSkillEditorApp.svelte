<script lang="ts">
    import { onDestroy } from "svelte";
    import { localize } from "../../../services/utilities";
    import { StoreManager } from "../../../utilities/StoreManager.svelte";
    import type { IStoreManager } from "../../../utilities/IStoreManager";
    import Image from "../../common-components/Image.svelte";
    import ItemSheetWrapper from "../../common-components/ItemSheetWrapper.svelte";
    import ItemSheetComponent from "../../common-components/ItemSheetComponent.svelte";
    import SpecializationCard from "./SpecializationCard.svelte";

    let { actor, skill, app }: { actor: Actor; skill: Item; app: any } = $props();

    // ─── StoreManager setup ───────────────────────────────────────────────────

    const storeManager = StoreManager.Instance as IStoreManager;
    storeManager.Subscribe(actor);
    storeManager.Subscribe(skill);

    // ─── Stores ───────────────────────────────────────────────────────────────

    const isCreation = storeManager.GetFlagStore<boolean>(actor, "isCharacterCreation", false);
    const languageSpent = storeManager.GetRWStore<number>(actor, "creation.languageSpent");
    const intelligenceStore = storeManager.GetRWStore<number>(actor, "attributes.intelligence.value");
    const valueStore = storeManager.GetRWStore<number>(skill, "languageSkill.value");
    const specializationsStore = storeManager.GetRWStore<Array<{ name: string; value: number }>>(
        skill,
        "languageSkill.specializations"
    );

    // ─── Linked attribute rating (computed once) ──────────────────────────────

    const linkedAttribute = (skill.system as Record<string, any>).languageSkill.linkedAttribute as string;
    const attrs = (actor.system as Record<string, any>)?.attributes ?? {};
    const linkedAttrRating =
        Number(attrs[linkedAttribute]?.value ?? 0) + Number(attrs[linkedAttribute]?.modifier ?? 0);

    // ─── Derived state ────────────────────────────────────────────────────────

    const readWrite = $derived($valueStore <= 1 ? 0 : Math.floor($valueStore / 2));
    const availableLanguagePoints = $derived(Math.floor(($intelligenceStore ?? 1) * 1.5) - ($languageSpent ?? 0));
    const disableControls = $derived($isCreation && $specializationsStore.length > 0);

    // ─── Sync readwrite to Foundry whenever valueStore changes ───────────────

    $effect(() => {
        const rw = $valueStore <= 1 ? 0 : Math.floor($valueStore / 2);
        skill.update({ "system.languageSkill.readwrite.value": rw }, { render: false }).catch(() => { /* no-op */ });
    });

    // ─── Commit trigger exposure ──────────────────────────────────────────────

    $effect(() => {
        if (app) {
            app.requestCommit = () => { /* Phase 3: karma commit hook */ };
        }
    });

    // ─── Increment / Decrement ────────────────────────────────────────────────

    function increment(): void {
        if (!$isCreation) return; // Phase 3: karma shopping
        if ($valueStore >= 6) return;
        const cost = $valueStore < linkedAttrRating ? 1 : 2;
        if (availableLanguagePoints < cost) return;
        $valueStore += 1;
        $languageSpent = ($languageSpent ?? 0) + cost;
    }

    function decrement(): void {
        if (!$isCreation) return; // Phase 3: karma shopping
        if ($valueStore <= 0) return;
        const refund = $valueStore > linkedAttrRating ? 2 : 1;
        $valueStore -= 1;
        $languageSpent = ($languageSpent ?? 0) - refund;
    }

    // ─── Specializations / Lingos ─────────────────────────────────────────────

    function addSpecialization(): void {
        if (!$isCreation) return;
        if ($specializationsStore.length > 0) {
            ui.notifications?.info(localize(CONFIG.SR3E.SKILL?.onlyonespecializationatcreation ?? "sr3e.skill.onlyonespecializationatcreation"));
            return;
        }
        if ($valueStore <= 1) return;
        const newSpec = {
            name: localize(CONFIG.SR3E.SKILL?.newspecialization ?? "sr3e.skill.newspecialization"),
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
                if ($specializationsStore.length > 0) {
                    $specializationsStore = [];
                    $valueStore += 1;
                }
                let refund = 0;
                for (let i = 1; i <= $valueStore; i++) {
                    refund += i <= linkedAttrRating ? 1 : 2;
                }
                $languageSpent = ($languageSpent ?? 0) - refund;
                $valueStore = 0;
                ui.notifications?.info(localize("SR3E.notifications.skillpointsrefund"));
            }
            await actor.deleteEmbeddedDocuments("Item", [skill.id!]);
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

            <!-- Title + value + read/write -->
            <div class="skill-hud-display">
                <div class="skill-hud-title-row">
                    <h2 class="skill-hud-name no-margin">{skill.name}</h2>
                    <h2 class="skill-hud-value-badge no-margin">{$valueStore}</h2>
                </div>
                <div class="skill-hud-title-row">
                    <span class="skill-hud-sub-label">{localize(CONFIG.SR3E.SKILL?.readwrite ?? "SR3E.skill.readwrite")}</span>
                    <span class="skill-hud-sub-value">{readWrite}</span>
                </div>
            </div>

            <!-- Controls: − + 🗑 -->
            <div class="skill-hud-controls">
                <button
                    type="button"
                    class="skill-hud-btn"
                    aria-label="Decrease skill"
                    onclick={decrement}
                    disabled={disableControls}
                ><i class="fa-solid fa-minus"></i></button>
                <button
                    type="button"
                    class="skill-hud-btn"
                    aria-label="Increase skill"
                    onclick={increment}
                    disabled={disableControls}
                ><i class="fa-solid fa-plus"></i></button>
                <button
                    type="button"
                    class="skill-hud-btn danger"
                    aria-label="Delete skill"
                    onclick={deleteSkill}
                ><i class="fa-solid fa-trash-can"></i></button>
            </div>

            <!-- Add lingo -->
            <button
                type="button"
                class="skill-add-spec-btn"
                aria-label="Add lingo"
                onclick={addSpecialization}
                disabled={$valueStore <= 1 || $specializationsStore.length > 0}
            >
                {localize(CONFIG.SR3E.SKILL?.specialize ?? "sr3e.skill.specialize")}
            </button>

        </div>
    </ItemSheetComponent>

    <!-- Lingos -->
    {#if $specializationsStore.length > 0}
        <ItemSheetComponent>
            <div class="skill-hud-spec-header">
                <span>{localize(CONFIG.SR3E.SKILL?.lingos ?? "SR3E.skill.lingos")}</span>
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
