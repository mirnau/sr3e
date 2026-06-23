<script lang="ts">
import { onMount, onDestroy, untrack } from "svelte";
import { sumMods, upsertMod, removeMod } from "../../services/combat/modifierList";
import { difficultyLabel } from "../../services/combat/procedures/composerHelpers";
import { registerComposer } from "../../services/combat/procedures/composerService";
import { executeProcedure } from "../../services/combat/orchestration/executeProcedure";
import type { ProcedureSetup } from "../../services/combat/procedures/simpleSetups";
import type { RollState, Modifier } from "../../services/combat/engine/types";
import type SR3EActor from "../../documents/SR3EActor";

const p = $props<{ actor: SR3EActor }>();
const actor = untrack(() => p.actor);

let visible = $state(false);
let setup: ProcedureSetup | null = $state(null);
let targetNumber = $state(4);
let modifiers: Modifier[] = $state([]);
let poolDice = $state(0);
let karmaDice = $state(0);
let isDefaulting = $state(false);
let hasTargets = $state(false);
let weaponMode = $state("");
let declaredRounds = $state(1);
let ammoAvailable: number | null = $state(null);

const modifiersTotal = $derived(sumMods(modifiers));
const finalTN = $derived(Math.max(2, targetNumber + modifiersTotal));
const difficulty = $derived(difficultyLabel(finalTN));
const canSubmit = $derived(finalTN >= 2 && !!setup);
const karmaCost = $derived(Math.round(0.5 * karmaDice * (karmaDice + 1)));
const isFirearm = $derived(setup?.kind === "firearm");
const showRounds = $derived(isFirearm && (weaponMode === "burst" || weaponMode === "fullauto"));

$effect(() => {
    if (!isFirearm) return;
    const roundCap = weaponMode === "burst" ? 3 : weaponMode === "fullauto" ? 10 : 1;
    const mag = ammoAvailable ?? roundCap;
    const min = weaponMode === "fullauto" ? 3 : 1;
    declaredRounds = Math.max(min, Math.min(declaredRounds, Math.min(roundCap, mag)));
});

$effect(() => {
    if (!hasTargets) modifiers = modifiers.filter(m => m.id !== "range");
});

export function open(newSetup: ProcedureSetup): void {
    setup = newSetup;
    const s = newSetup.rollState;
    targetNumber = s.targetNumber;
    modifiers = [...s.modifiers];
    poolDice = s.poolDice;
    karmaDice = s.karmaDice;
    isDefaulting = false;
    if (newSetup.kind === "firearm") {
        const st = newSetup as unknown as { weaponMode?: string; declaredRounds?: number; ammoAvailable?: number };
        weaponMode = st.weaponMode ?? "";
        declaredRounds = st.declaredRounds ?? 1;
        ammoAvailable = st.ammoAvailable ?? null;
    }
    visible = true;
}

async function onConfirm(): Promise<void> {
    if (!setup || !canSubmit) return;
    const finalState: RollState = {
        dice: setup.rollState.dice,
        poolDice: isDefaulting ? 0 : poolDice,
        karmaDice: isDefaulting ? 0 : karmaDice,
        targetNumber,
        modifiers,
    };
    visible = false;
    const targets = typeof game !== "undefined" ? Array.from((game.user as { targets?: Set<unknown> })?.targets ?? []) : [];
    await executeProcedure(setup, actor as never, { targets: targets as never[], rollState: finalState });
}

function addMod(): void {
    modifiers = upsertMod(modifiers, { id: `manual-${Date.now()}`, name: "modifier", value: 0 });
}

function removeMod_(id: string): void {
    modifiers = removeMod(modifiers, id);
}

let targetHook: number | null = null;

onMount(() => {
    registerComposer(open);
    if (typeof Hooks !== "undefined") {
        targetHook = Hooks.on("targetToken", (_user: unknown, _token: unknown, _targeted: unknown) => {
            hasTargets = typeof game !== "undefined" && ((game.user as { targets?: Set<unknown> })?.targets?.size ?? 0) > 0;
        });
    }
});

onDestroy(() => {
    if (typeof Hooks !== "undefined" && targetHook !== null) {
        Hooks.off("targetToken", targetHook);
    }
});
</script>

{#if visible && setup}
<div class="roll-composer-overlay" onclick={() => { visible = false; }} role="dialog" aria-modal="true" tabindex="-1">
    <div class="roll-composer-container" onclick={(e) => e.stopPropagation()} role="presentation">
        <div class="roll-composer-card">
            <h4 class="roll-composer-title">{setup.title}</h4>
        </div>
        <div class="roll-composer-card roll-composer-tn">
            <button class="tn-adjust" onclick={() => targetNumber--} aria-label="Decrease TN">−</button>
            <div class="tn-display">
                <span class="tn-value">{finalTN}</span>
                <span class="tn-difficulty">{difficulty}</span>
            </div>
            <button class="tn-adjust" onclick={() => targetNumber++} aria-label="Increase TN">+</button>
        </div>
        <div class="roll-composer-card roll-composer-mods">
            {#each modifiers as mod (mod.id ?? mod.name)}
                <div class="mod-row">
                    <input class="mod-name" bind:value={mod.name} />
                    <input class="mod-value" type="number" bind:value={mod.value} />
                    <button onclick={() => removeMod_(mod.id ?? mod.name)} aria-label="Remove modifier">✕</button>
                </div>
            {/each}
            <button class="add-mod" onclick={addMod}>+ modifier</button>
        </div>
        {#if !isDefaulting && poolDice >= 0}
            <div class="roll-composer-card roll-composer-pool">
                <span>Pool dice</span>
                <button onclick={() => poolDice = Math.max(0, poolDice - 1)}>−</button>
                <span class="pool-value">{poolDice}</span>
                <button onclick={() => poolDice++}>+</button>
            </div>
        {/if}
        {#if !isDefaulting}
            <div class="roll-composer-card roll-composer-karma">
                <span>Karma dice</span>
                <button onclick={() => karmaDice = Math.max(0, karmaDice - 1)}>−</button>
                <span class="pool-value">{karmaDice}</span>
                <button onclick={() => karmaDice++}>+</button>
                {#if karmaCost > 0}<span class="karma-cost">({karmaCost} karma)</span>{/if}
            </div>
        {/if}
        {#if isFirearm && showRounds}
            <div class="roll-composer-card roll-composer-rounds">
                <span>Rounds</span>
                <button onclick={() => declaredRounds = Math.max(1, declaredRounds - 1)}>−</button>
                <span class="pool-value">{declaredRounds}</span>
                <button onclick={() => declaredRounds++}>+</button>
            </div>
        {/if}
        <button class="sr3e-response-button-primary" onclick={onConfirm} disabled={!canSubmit}>
            Roll
        </button>
    </div>
</div>
{/if}
