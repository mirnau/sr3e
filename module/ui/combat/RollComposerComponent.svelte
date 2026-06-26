<script lang="ts">
import { onDestroy, onMount, untrack } from "svelte";
import { sumMods, upsertMod, removeMod } from "../../services/combat/modifierList";
import { difficultyLabel } from "../../services/combat/procedures/composerHelpers";
import {
    getComposerState,
    clearComposerState,
    registerComposerForActor,
    unregisterComposerForActor,
} from "../../services/combat/procedures/composerService.svelte";
import { executeProcedure } from "../../services/combat/orchestration/executeProcedure";
import type { IStoreManager } from "../../utilities/IStoreManager";
import { StoreManager } from "../../utilities/StoreManager.svelte";
import type { ProcedureSetup } from "../../services/combat/procedures/simpleSetups";
import type { RollState, Modifier } from "../../services/combat/engine/types";

const p = $props<{ actor: unknown; actorId: string }>();
const actor = untrack(() => p.actor) as any;
const actorId = untrack(() => p.actorId);

const storeManager = StoreManager.Instance as IStoreManager;
storeManager.Subscribe(actor);

const karmaPoolStore = storeManager.GetRWStore<number>(actor, "karma.karmaPool.value");

const composerState = getComposerState(actorId);

let setup: ProcedureSetup | null = $state(null);
let targetNumber = $state(4);
let modifiers: Modifier[] = $state([]);
let poolDice = $state(0);
let karmaDice = $state(0);
let isDefaulting = $state(false);

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

$effect(() => { if (poolDice > poolAvailable) poolDice = Math.max(0, poolAvailable); });
$effect(() => { if (karmaDice > karmaCap) karmaDice = Math.max(0, karmaCap); });

export function open(newSetup: ProcedureSetup): void {
    setup = newSetup;
    targetNumber = 4;
    modifiers = [];
    poolDice = 0;
    karmaDice = 0;
    isDefaulting = false;
    composerState.isOpen = true;
    composerState.selectedPoolKey = null;
    composerState.poolAvailable = 0;
}

function onReset(): void {
    targetNumber = 4;
    modifiers = [];
    poolDice = 0;
    karmaDice = 0;
    isDefaulting = false;
    composerState.selectedPoolKey = null;
    composerState.poolAvailable = 0;
}

function onClose(): void {
    composerState.isOpen = false;
    composerState.selectedPoolKey = null;
    setup = null;
}

async function onConfirm(): Promise<void> {
    if (!setup || !canSubmit) return;

    const currentSetup = setup;
    const finalState: RollState = {
        dice: currentSetup.rollState.dice,
        poolDice,
        karmaDice,
        targetNumber,
        modifiers,
    };

    const poolKey = composerState.selectedPoolKey;
    const usedPool = poolDice;
    const usedKarma = karmaCost;

    composerState.isOpen = false;
    composerState.selectedPoolKey = null;
    setup = null;

    const updates: Record<string, unknown> = {};
    if (poolKey && usedPool > 0) {
        const pool = actor.system?.dicePools?.[poolKey];
        if (pool) updates[`system.dicePools.${poolKey}.spent`] = (pool.spent ?? 0) + usedPool;
    }
    if (usedKarma > 0) {
        updates["system.karma.karmaPool.value"] = Math.max(0, karmaBalance - usedKarma);
    }
    if (Object.keys(updates).length > 0) {
        await actor.update?.(updates, { render: false });
    }

    const targets = typeof game !== "undefined"
        ? Array.from((game.user as any)?.targets ?? [])
        : [];
    await executeProcedure(currentSetup, actor, { targets: targets as never[], rollState: finalState, poolKey: poolKey ?? undefined });
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
    storeManager.Unsubscribe(actor);
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
                <select bind:value={isDefaulting} class="roll-composer-type-select">
                    <option value={false}>Regular roll</option>
                    <option value={true}>Defaulting</option>
                </select>
            </div>
        </div>

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
        {:else if !isDefaulting}
            <div class="attribute-card composer-unit composer-unit--hint">
                <div class="attribute-card-shadow"></div>
                <div class="attribute-card-outline">
                    <div class="attribute-card-displayarea"></div>
                    <p class="pool-hint-text">← click a pool to add dice</p>
                </div>
            </div>
        {/if}

        <!-- Karma -->
        {#if !isDefaulting}
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
