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
    const knowledgePoints = storeManager.GetRWStore<number>(actor, "creation.knowledgePoints");
    const valueStore = storeManager.GetRWStore<number>(skill, "knowledgeSkill.value");
    const specializationsStore = storeManager.GetRWStore<Array<{ name: string; value: number }>>(
        skill,
        "knowledgeSkill.specializations"
    );

    // ─── Linked attribute rating (Intelligence — always the linked attr for knowledge skills per SR3e rules) ──────────────────────────────

    const attrs = (actor.system as Record<string, any>)?.attributes ?? {};
    const linkedAttrRating =
        Number(attrs["intelligence"]?.value ?? 0) + Number(attrs["intelligence"]?.modifier ?? 0);

    // ─── Derived state ────────────────────────────────────────────────────────

    const availableKnowledgePoints = $derived($knowledgePoints ?? 0);
    const disableControls = $derived($isCreation && $specializationsStore.length > 0);

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
        if (availableKnowledgePoints < cost) return;
        $valueStore += 1;
        $knowledgePoints = ($knowledgePoints ?? 0) - cost;
    }

    function decrement(): void {
        if (!$isCreation) return; // Phase 3: karma shopping
        if ($valueStore <= 0) return;
        const refund = $valueStore > linkedAttrRating ? 2 : 1;
        $valueStore -= 1;
        $knowledgePoints = ($knowledgePoints ?? 0) + refund;
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
            let refundedPoints: number | undefined;
            if ($isCreation) {
                const baseRating = $specializationsStore.length > 0 ? ($valueStore ?? 0) + 1 : ($valueStore ?? 0);
                let refund = 0;
                for (let i = 1; i <= baseRating; i++) {
                    refund += i <= linkedAttrRating ? 1 : 2;
                }
                refundedPoints = ($knowledgePoints ?? 0) + refund;
            }
            await actor.deleteEmbeddedDocuments("Item", [skill.id!]);
            if (refundedPoints !== undefined) {
                $knowledgePoints = refundedPoints;
                ui.notifications?.info(localize("SR3E.notifications.skillpointsrefund"));
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
