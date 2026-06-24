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
    composerState.isOpen = true;
    composerState.selectedPoolKey = null;
    composerState.poolAvailable = 0;
}

function onReset(): void {
    targetNumber = 4;
    modifiers = [];
    poolDice = 0;
    karmaDice = 0;
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

    const finalState: RollState = {
        dice: setup.rollState.dice,
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

    if (poolKey && usedPool > 0) {
        const pool = actor.system?.dicePools?.[poolKey];
        if (pool) {
            await actor.update?.({ [`system.dicePools.${poolKey}.spent`]: (pool.spent ?? 0) + usedPool });
        }
    }
    if (usedKarma > 0) {
        await actor.update?.({ "system.karma.karmaPool.value": Math.max(0, karmaBalance - usedKarma) });
    }

    const targets = typeof game !== "undefined"
        ? Array.from((game.user as any)?.targets ?? [])
        : [];
    await executeProcedure(setup!, actor, { targets: targets as never[], rollState: finalState });
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

        <div class="roll-composer-header">
            <h2 class="roll-composer-title">{setup.title}</h2>
            <div class="roll-composer-header-actions">
                <button class="composer-btn-reset" onclick={onReset} title="Reset">↺</button>
                <button class="composer-btn-close" onclick={onClose} title="Close">✕</button>
            </div>
        </div>

        <div class="attribute-card roll-composer-tn-card">
            <div class="attribute-card-shadow"></div>
            <div class="attribute-card-outline">
                <div class="attribute-card-displayarea"></div>
                <div class="roll-composer-tn-controls">
                    <button class="composer-hud-btn" onclick={() => targetNumber--} aria-label="Decrease TN">
                        <i class="fa-solid fa-minus"></i>
                    </button>
                    <span class="tn-value">{finalTN}</span>
                    <button class="composer-hud-btn" onclick={() => targetNumber++} aria-label="Increase TN">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </div>
                <div class="attribute-label">{difficulty}</div>
            </div>
        </div>

        <div class="roll-composer-mods">
            {#each modifiers as mod (mod.id ?? mod.name)}
                <div class="mod-row">
                    <input class="mod-name" bind:value={mod.name} />
                    <input class="mod-value" type="number" bind:value={mod.value} />
                    <button class="composer-hud-btn composer-hud-btn--danger" onclick={() => removeModById(mod.id ?? mod.name)} aria-label="Remove">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            {/each}
            <button class="composer-hud-btn composer-hud-btn--add" onclick={addMod}>
                <i class="fa-solid fa-plus"></i> modifier
            </button>
        </div>

        {#if composerState.selectedPoolKey && poolAvailable > 0}
            <div class="roll-composer-pool">
                <span>Pool <span class="pool-available">({poolAvailable} left)</span></span>
                <button class="composer-hud-btn" onclick={() => poolDice = Math.max(0, poolDice - 1)}>
                    <i class="fa-solid fa-minus"></i>
                </button>
                <span class="pool-value">{poolDice}</span>
                <button class="composer-hud-btn" onclick={() => poolDice = Math.min(poolAvailable, poolDice + 1)}>
                    <i class="fa-solid fa-plus"></i>
                </button>
            </div>
        {:else}
            <div class="roll-composer-pool-hint">
                <span class="pool-hint-text">← click a pool to add dice</span>
            </div>
        {/if}

        <div class="roll-composer-karma">
            <span>Karma <span class="pool-available">({karmaBalance})</span></span>
            <button class="composer-hud-btn" onclick={() => karmaDice = Math.max(0, karmaDice - 1)}>
                <i class="fa-solid fa-minus"></i>
            </button>
            <span class="pool-value">{karmaDice}</span>
            <button class="composer-hud-btn" onclick={() => karmaDice = Math.min(karmaCap, karmaDice + 1)}>
                <i class="fa-solid fa-plus"></i>
            </button>
            {#if karmaCost > 0}<span class="karma-cost">({karmaCost} karma)</span>{/if}
        </div>

        <button class="sr3e-response-button-primary" onclick={onConfirm} disabled={!canSubmit}>
            Roll
        </button>
    </div>
</div>
{/if}
