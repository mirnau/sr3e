<script lang="ts">
import { onDestroy, onMount, untrack } from "svelte";
import { writable } from "svelte/store";
import { sumMods, upsertMod, removeMod } from "../../services/combat/modifierList";
import { difficultyLabel } from "../../services/combat/procedures/composerHelpers";
import {
    getComposerState,
    clearComposerState,
    registerComposerForActor,
    unregisterComposerForActor,
} from "../../services/combat/procedures/composerService.svelte";
import { executeProcedure } from "../../services/combat/orchestration/executeProcedure";
import { spendProcedureFocus, spendProcedurePool } from "../../services/combat/procedures/poolSpend";
import type { IStoreManager } from "../../utilities/IStoreManager";
import { StoreManager } from "../../utilities/StoreManager.svelte";
import type { ProcedureSetup } from "../../services/combat/procedures/simpleSetups";
import type { RollState, Modifier } from "../../services/combat/engine/types";

const p = $props<{ actor?: unknown; actorId?: string }>();
const hasActorProp = untrack(() => !!p.actor);
const actor = untrack(() => p.actor) as any ?? { uuid: "sr3e-roll-composer-test", id: "sr3e-roll-composer-test", system: { karma: { karmaPool: { value: 0 } } } };
const actorId = untrack(() => p.actorId ?? actor.id ?? "sr3e-roll-composer-test");

const storeManager = StoreManager.Instance as IStoreManager;
if (hasActorProp) storeManager.Subscribe(actor);

const karmaPoolStore = hasActorProp
    ? storeManager.GetRWStore<number>(actor, "karma.karmaPool.value")
    : writable(0);

const composerState = getComposerState(actorId);

let setup: ProcedureSetup | null = $state(null);
let targetNumber = $state(4);
let modifiers: Modifier[] = $state([]);
let poolDice = $state(0);
let focusDice = $state(0);
let karmaDice = $state(0);
let isDefaulting = $state(false);
let selectedForce = $state(1);
let selectedDamageLevel = $state("m");

const modifiersTotal = $derived(sumMods(modifiers));
const finalTN = $derived(Math.max(2, targetNumber + modifiersTotal));
const difficulty = $derived(difficultyLabel(finalTN));
const canSubmit = $derived(finalTN >= 2 && !!setup);
const karmaCost = $derived(Math.round(0.5 * karmaDice * (karmaDice + 1)));
const karmaBalance = $derived($karmaPoolStore ?? 0);
const maxAffordable = $derived(
    karmaBalance > 0 ? Math.floor((-1 + Math.sqrt(1 + 8 * karmaBalance)) * 0.5) : 0
);
const karmaCap = $derived(Math.min(maxAffordable, setup?.rollState.dice ?? 0));
const poolAvailable = $derived(composerState.poolAvailable);
const focusAvailable = $derived(composerState.focusAvailable);
const forceControl = $derived(setup?.forceControl ?? null);
const forceMin = $derived(forceControl?.min ?? 1);
const forceMax = $derived(forceControl?.max ?? 1);
const damageLevelControl = $derived(setup?.damageLevelControl ?? null);
const selectedFocusLabel = $derived(
    composerState.focusOptions.find(option => option.key === composerState.selectedFocusKey)?.label ?? composerState.selectedFocusKey
);

$effect(() => { if (poolDice > poolAvailable) poolDice = Math.max(0, poolAvailable); });
$effect(() => { if (focusDice > focusAvailable) focusDice = Math.max(0, focusAvailable); });
$effect(() => { if (karmaDice > karmaCap) karmaDice = Math.max(0, karmaCap); });

export function open(newSetup: ProcedureSetup): void {
    setup = newSetup;
    targetNumber = newSetup.rollState.targetNumber;
    const woundPenalty = Number((actor.system as any)?.health?.penalty?.value ?? 0);
    modifiers = [
        ...(newSetup.rollState.modifiers ?? []),
        ...(woundPenalty > 0 ? [{ id: "wound-penalty", name: "Wound Penalty", value: woundPenalty }] : []),
    ];
    poolDice = 0;
    focusDice = 0;
    karmaDice = 0;
    selectedForce = newSetup.forceControl?.value ?? 1;
    selectedDamageLevel = newSetup.damageLevelControl?.value ?? "m";
    isDefaulting = false;
    composerState.isOpen = true;
    composerState.selectedFocusKey = null;
    composerState.focusAvailable = 0;
    composerState.focusOptions = (newSetup.poolOptions ?? []).map(option => ({
        key: option.key,
        label: option.label,
        available: option.available,
    }));

    if (newSetup.initialPoolKey) {
        const pool = (actor.system as any)?.dicePools?.[newSetup.initialPoolKey];
        composerState.selectedPoolKey = newSetup.initialPoolKey;
        composerState.poolAvailable = Math.max(0, (pool?.value ?? 0) - (pool?.spent ?? 0));
    } else {
        composerState.selectedPoolKey = null;
        composerState.poolAvailable = 0;
    }
}

function onReset(): void {
    targetNumber = 4;
    modifiers = [];
    poolDice = 0;
    focusDice = 0;
    karmaDice = 0;
    selectedForce = setup?.forceControl?.value ?? 1;
    selectedDamageLevel = setup?.damageLevelControl?.value ?? "m";
    isDefaulting = false;
    composerState.selectedPoolKey = null;
    composerState.poolAvailable = 0;
    composerState.selectedFocusKey = null;
    composerState.focusAvailable = 0;
}

function onClose(): void {
    composerState.isOpen = false;
    composerState.selectedPoolKey = null;
    composerState.selectedFocusKey = null;
    setup = null;
}

async function onConfirm(): Promise<void> {
    if (!setup || !canSubmit) return;

    const currentSetup = withSelectedSpellOptions(setup, selectedForce, selectedDamageLevel);
    const finalState: RollState = {
        dice: currentSetup.rollState.dice,
        poolDice,
        focusDice,
        focusKey: composerState.selectedFocusKey ?? undefined,
        focusLabel: selectedFocusLabel ?? undefined,
        karmaDice,
        targetNumber,
        modifiers,
    };

    const poolKey = composerState.selectedPoolKey;
    const focusKey = composerState.selectedFocusKey;
    const usedPool = poolDice;
    const usedFocus = focusDice;
    const usedKarma = karmaCost;

    composerState.isOpen = false;
    composerState.selectedPoolKey = null;
    composerState.selectedFocusKey = null;
    setup = null;

    const updates: Record<string, unknown> = {};
    Object.assign(updates, await spendProcedurePool(actor, poolKey, usedPool));
    await spendProcedureFocus(actor, focusKey, usedFocus);
    if (usedKarma > 0) {
        updates["system.karma.karmaPool.value"] = Math.max(0, karmaBalance - usedKarma);
    }
    if (Object.keys(updates).length > 0) {
        await actor.update?.(updates, { render: false });
    }

    const targets = typeof game !== "undefined"
        ? Array.from((game.user as any)?.targets ?? [])
        : [];
    await executeProcedure(currentSetup, actor, { targets: targets as never[], rollState: finalState, poolKey: poolKey ?? undefined, advanced: true });
}

function withSelectedSpellOptions(base: ProcedureSetup, force: number, damageLevel: string): ProcedureSetup {
    if (!base.extraOptions?.spell) return base;
    const bounded = base.forceControl
        ? Math.min(Math.max(force, base.forceControl.min), base.forceControl.max)
        : force;
    const level = base.damageLevelControl ? damageLevel : (base.extraOptions.spell as Record<string, unknown>).damageLevel;
    return {
        ...base,
        forceControl: base.forceControl ? { ...base.forceControl, value: bounded } : undefined,
        damageLevelControl: base.damageLevelControl ? { ...base.damageLevelControl, value: String(level) } : undefined,
        extraOptions: {
            ...base.extraOptions,
            spell: { ...(base.extraOptions.spell as Record<string, unknown>), force: bounded, damageLevel: level },
        },
        exportFn: () => {
            const ctx = base.exportFn();
            return {
                ...ctx,
                next: {
                    ...ctx.next,
                    args: { ...ctx.next.args, force: bounded, damageLevel: level },
                },
            };
        },
    };
}

function addMod(): void {
    modifiers = upsertMod(modifiers, { id: `manual-${Date.now()}`, name: "modifier", value: 0 });
}

function removeModById(id: string): void {
    modifiers = removeMod(modifiers, id);
}

onMount(() => registerComposerForActor(actorId, open));
onDestroy(() => {
    unregisterComposerForActor(actorId);
    clearComposerState(actorId);
    if (hasActorProp) storeManager.Unsubscribe(actor);
});
</script>

{#if composerState.isOpen && setup}
<div class="sheet-card-component roll-composer-panel">
    <div class="sheet-card-shadow"></div>
    <div class="sheet-card-outline">
        <div class="sheet-card-displayarea"></div>

        <!-- Header: title, roll type, reset/close -->
        <div class="attribute-card composer-unit">
            <div class="attribute-card-shadow"></div>
            <div class="attribute-card-outline">
                <div class="attribute-card-displayarea"></div>
                <div class="roll-composer-header">
                    <h2 class="roll-composer-title">{setup.title}</h2>
                    <div class="roll-composer-header-actions">
                        <button class="composer-btn-reset" onclick={onReset} title="Reset">↺</button>
                        <button class="composer-btn-close" onclick={onClose} title="Close">✕</button>
                    </div>
                </div>
                {#if !setup.openTest}
                <select bind:value={isDefaulting} class="roll-composer-type-select">
                    <option value={false}>Regular roll</option>
                    <option value={true}>Defaulting</option>
                </select>
                {/if}
            </div>
        </div>

        {#if !setup.openTest}
        {#if forceControl}
        <!-- Spell Force -->
        <div class="attribute-card composer-unit">
            <div class="attribute-card-shadow"></div>
            <div class="attribute-card-outline">
                <div class="attribute-card-displayarea"></div>
                <h3 class="no-margin">Force</h3>
                <p class="composer-unit-meta composer-unit-meta--center">Max: {forceMax}</p>
                <div class="composer-counter">
                    <button class="composer-hud-btn" onclick={() => selectedForce = Math.max(forceMin, selectedForce - 1)} aria-label="Decrease Force">
                        <i class="fa-solid fa-minus"></i>
                    </button>
                    <h1 class="counter-value">{selectedForce}</h1>
                    <button class="composer-hud-btn" onclick={() => selectedForce = Math.min(forceMax, selectedForce + 1)} aria-label="Increase Force">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </div>
            </div>
        </div>
        {/if}

        {#if damageLevelControl}
        <!-- Spell Damage Level -->
        <div class="attribute-card composer-unit">
            <div class="attribute-card-shadow"></div>
            <div class="attribute-card-outline">
                <div class="attribute-card-displayarea"></div>
                <h3 class="no-margin">Damage Level</h3>
                <select bind:value={selectedDamageLevel} class="roll-composer-type-select">
                    {#each damageLevelControl.options as option (option.value)}
                        <option value={option.value}>{option.label}</option>
                    {/each}
                </select>
            </div>
        </div>
        {/if}

        <!-- Target Number -->
        <div class="attribute-card composer-unit">
            <div class="attribute-card-shadow"></div>
            <div class="attribute-card-outline">
                <div class="attribute-card-displayarea"></div>
                <h3 class="no-margin">Target Number</h3>
                <p class="composer-unit-meta composer-unit-meta--center">{difficulty} · Final: {finalTN}</p>
                <div class="composer-counter">
                    <button class="composer-hud-btn" onclick={() => targetNumber = Math.max(2, targetNumber - 1)} aria-label="Decrease TN">
                        <i class="fa-solid fa-minus"></i>
                    </button>
                    <h1 class="counter-value">{targetNumber}</h1>
                    <button class="composer-hud-btn" onclick={() => targetNumber++} aria-label="Increase TN">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </div>
            </div>
        </div>

        <!-- T.N. Modifiers -->
        <div class="attribute-card composer-unit">
            <div class="attribute-card-shadow"></div>
            <div class="attribute-card-outline">
                <div class="attribute-card-displayarea"></div>
                <div class="composer-unit-row">
                    <h3 class="no-margin">T.N. Modifiers</h3>
                    <span class="composer-unit-meta">Total: {modifiersTotal > 0 ? `+${modifiersTotal}` : modifiersTotal}</span>
                </div>
                <button class="composer-hud-btn composer-hud-btn--add" onclick={addMod}>
                    <span>Add</span>
                </button>
                {#each modifiers as mod (mod.id ?? mod.name)}
                    <div class="mod-row">
                        <input class="mod-name" bind:value={mod.name} />
                        <div class="composer-counter composer-counter--compact">
                            <button class="composer-hud-btn" onclick={() => { mod.value--; modifiers = [...modifiers]; }}>
                                <i class="fa-solid fa-minus"></i>
                            </button>
                            <h1 class="counter-value counter-value--sm">{mod.value}</h1>
                            <button class="composer-hud-btn" onclick={() => { mod.value++; modifiers = [...modifiers]; }}>
                                <i class="fa-solid fa-plus"></i>
                            </button>
                        </div>
                        <button class="composer-hud-btn composer-hud-btn--danger" onclick={() => removeModById(mod.id ?? mod.name)} aria-label="Remove">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                {/each}
            </div>
        </div>
        {/if}

        <!-- Dice Pool -->
        {#if !isDefaulting && composerState.selectedPoolKey}
            <div class="attribute-card composer-unit composer-unit--pool-active">
                <div class="attribute-card-shadow"></div>
                <div class="attribute-card-outline">
                    <div class="attribute-card-displayarea"></div>
                    <div class="composer-unit-row">
                        <h3 class="no-margin">{composerState.selectedPoolKey}</h3>
                        <span class="composer-unit-meta">Available: {poolAvailable}</span>
                    </div>
                    <div class="composer-counter composer-counter--compact">
                        <button class="composer-hud-btn" onclick={() => poolDice = Math.max(0, poolDice - 1)}>
                            <i class="fa-solid fa-minus"></i>
                        </button>
                        <h1 class="counter-value counter-value--sm">{poolDice}</h1>
                        <button class="composer-hud-btn" onclick={() => poolDice = Math.min(poolAvailable, poolDice + 1)}>
                            <i class="fa-solid fa-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        {:else if !isDefaulting && !composerState.selectedFocusKey}
            <div class="attribute-card composer-unit composer-unit--hint">
                <div class="attribute-card-shadow"></div>
                <div class="attribute-card-outline">
                    <div class="attribute-card-displayarea"></div>
                    <p class="pool-hint-text">← click a pool to add dice</p>
                </div>
            </div>
        {/if}

        {#if !isDefaulting && composerState.selectedFocusKey}
            <div class="attribute-card composer-unit composer-unit--pool-active">
                <div class="attribute-card-shadow"></div>
                <div class="attribute-card-outline">
                    <div class="attribute-card-displayarea"></div>
                    <div class="composer-unit-row">
                        <h3 class="no-margin">{selectedFocusLabel}</h3>
                        <span class="composer-unit-meta">Available: {focusAvailable}</span>
                    </div>
                    <div class="composer-counter composer-counter--compact">
                        <button class="composer-hud-btn" onclick={() => focusDice = Math.max(0, focusDice - 1)}>
                            <i class="fa-solid fa-minus"></i>
                        </button>
                        <h1 class="counter-value counter-value--sm">{focusDice}</h1>
                        <button class="composer-hud-btn" onclick={() => focusDice = Math.min(focusAvailable, focusDice + 1)}>
                            <i class="fa-solid fa-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        {/if}

        <!-- Karma dice double the character's base skill/attribute dice, so a
             roll with no base dice (e.g. Dodge, which is Combat-Pool-only)
             can never have any to add — hide the control instead of showing
             a permanently-stuck-at-zero one. -->
        {#if !isDefaulting && (setup?.rollState.dice ?? 0) > 0}
            <div class="attribute-card composer-unit">
                <div class="attribute-card-shadow"></div>
                <div class="attribute-card-outline">
                    <div class="attribute-card-displayarea"></div>
                    <div class="composer-unit-row">
                        <h3 class="no-margin">Karma</h3>
                        <span class="composer-unit-meta">Pool: {karmaBalance} · Cost: {karmaCost}</span>
                    </div>
                    <div class="composer-counter composer-counter--compact">
                        <button class="composer-hud-btn" onclick={() => karmaDice = Math.max(0, karmaDice - 1)}>
                            <i class="fa-solid fa-minus"></i>
                        </button>
                        <h1 class="counter-value counter-value--sm">{karmaDice}</h1>
                        <button class="composer-hud-btn" onclick={() => karmaDice = Math.min(karmaCap, karmaDice + 1)}>
                            <i class="fa-solid fa-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        {/if}

        <button class="composer-hud-btn composer-hud-btn--add" onclick={onConfirm} disabled={!canSubmit}>
            <span>Roll</span>
        </button>
    </div>
</div>
{/if}
