<script lang="ts">
    import { onDestroy } from "svelte";
    import { localize } from "../../../services/utilities";
    import { StoreManager } from "../../../utilities/StoreManager.svelte";
    import type { IStoreManager } from "../../../utilities/IStoreManager";
    import SpecializationCard from "./SpecializationCard.svelte";

    let { actor, skill, app }: { actor: Actor; skill: Item; app: any } = $props();

    // ─── StoreManager setup ───────────────────────────────────────────────────

    const storeManager = StoreManager.Instance as IStoreManager;
    storeManager.Subscribe(actor);
    storeManager.Subscribe(skill);

    // ─── Stores ───────────────────────────────────────────────────────────────

    const isCreation = storeManager.GetFlagStore<boolean>(actor, "isCharacterCreation", false);
    const attrLocked = storeManager.GetFlagStore<boolean>(actor, "attributeAssignmentLocked", false);
    const knowledgePoints = storeManager.GetRWStore<number>(actor, "creation.knowledgePoints");
    const valueStore = storeManager.GetRWStore<number>(skill, "knowledgeSkill.value");
    const specializationsStore = storeManager.GetRWStore<Array<{ name: string; value: number }>>(
        skill,
        "knowledgeSkill.specializations"
    );

    // ─── Linked attribute rating (computed once) ──────────────────────────────

    const linkedAttribute = (skill.system as Record<string, any>).knowledgeSkill.linkedAttribute as string;
    const attrs = (actor.system as Record<string, any>)?.attributes ?? {};
    const linkedAttrRating =
        Number(attrs[linkedAttribute]?.value ?? 0) + Number(attrs[linkedAttribute]?.modifier ?? 0);

    // ─── Derived state ────────────────────────────────────────────────────────

    const disableControls = $derived($isCreation && $specializationsStore.length > 0);

    // ─── Commit trigger exposure ──────────────────────────────────────────────

    $effect(() => {
        if (app) {
            app.requestCommit = () => { /* Phase 3: karma commit hook */ };
        }
    });

    // ─── Increment / Decrement ────────────────────────────────────────────────

    function increment(): void {
        if (!$attrLocked) {
            ui.notifications?.warn(localize("SR3E.notifications.assignattributesfirst"));
            return;
        }
        if (!$isCreation) return; // Phase 3: karma shopping
        if ($valueStore >= 6) return;
        const cost = $valueStore < linkedAttrRating ? 1 : 2;
        if ($knowledgePoints < cost) return;
        $valueStore += 1;
        $knowledgePoints -= cost;
    }

    function decrement(): void {
        if (!$attrLocked) {
            ui.notifications?.warn(localize("SR3E.notifications.assignattributesfirst"));
            return;
        }
        if (!$isCreation) return;
        if ($valueStore <= 0) return;
        const refund = $valueStore > linkedAttrRating ? 2 : 1;
        $valueStore -= 1;
        $knowledgePoints += refund;
    }

    // ─── Specializations ──────────────────────────────────────────────────────

    function addSpecialization(): void {
        if (!$isCreation) return;
        if ($specializationsStore.length > 0) {
            ui.notifications?.info(localize("SR3E.skill.onlyonespecializationatcreation"));
            return;
        }
        if ($valueStore <= 1) return;
        const newSpec = {
            name: localize("SR3E.skill.newspecialization"),
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
                $knowledgePoints += refund;
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

<div class="sr3e-waterfall-wrapper">
    <div class="sr3e-waterfall sr3e-waterfall--single">

        <!-- Panel 1: Skill info + controls -->
        <div class="item-sheet-component">
            <div class="sr3e-inner-background-container">
                <div class="fake-shadow"></div>
                <div class="sr3e-inner-background">
                    <div class="image-mask">
                        <img
                            src={skill.img}
                            role="presentation"
                            data-edit="img"
                            title={skill.name}
                            alt={skill.name}
                        />
                    </div>
                    <div class="stat-grid single-column">
                        <div class="stat-card">
                            <div class="stat-card-background"></div>
                            <h1>{skill.name}</h1>
                        </div>
                        <div class="stat-card">
                            <div class="stat-card-background"></div>
                            <h1>{$valueStore}</h1>
                        </div>
                        <div class="stat-card">
                            <div class="stat-card-background"></div>
                            <div class="buttons-horizontal-distribution">
                                <button
                                    type="button"
                                    class="header-control icon sr3e-toolbar-button"
                                    aria-label="Increase skill"
                                    onclick={increment}
                                    disabled={disableControls}
                                >
                                    <i class="fa-solid fa-plus"></i>
                                </button>
                                <button
                                    type="button"
                                    class="header-control icon sr3e-toolbar-button"
                                    aria-label="Decrease skill"
                                    onclick={decrement}
                                    disabled={disableControls}
                                >
                                    <i class="fa-solid fa-minus"></i>
                                </button>
                                <button
                                    type="button"
                                    class="header-control icon sr3e-toolbar-button"
                                    aria-label="Delete skill"
                                    onclick={deleteSkill}
                                >
                                    <i class="fa-solid fa-trash-can"></i>
                                </button>
                                <button
                                    type="button"
                                    class="header-control icon sr3e-toolbar-button"
                                    aria-label="Add specialization"
                                    onclick={addSpecialization}
                                    disabled={$valueStore <= 1}
                                >
                                    {localize(CONFIG.SR3E.SKILL?.specialization ?? "SR3E.skill.addspecialization")}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Panel 2: Specializations -->
        <div class="item-sheet-component">
            <div class="sr3e-inner-background-container">
                <div class="fake-shadow"></div>
                <div class="sr3e-inner-background">
                    <h1 class="uppercase">
                        {localize(CONFIG.SR3E.SKILL?.specialization ?? "SR3E.skill.specializations")}
                    </h1>
                    <div class="stat-grid single-column">
                        {#each $specializationsStore as spec, _i}
                            <SpecializationCard
                                bind:specialization={$specializationsStore[_i]}
                                {actor}
                                {skill}
                                isCreationMode={$isCreation}
                                ondelete={deleteSpecialization}
                                onchange={() => { $specializationsStore = [...$specializationsStore]; }}
                            />
                        {/each}
                    </div>
                </div>
            </div>
        </div>

    </div>
</div>
