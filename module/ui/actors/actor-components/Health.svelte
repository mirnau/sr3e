<script lang="ts">
import type { Writable } from "svelte/store";
import { onMount } from "svelte";
import type { IStoreManager } from "../../../utilities/IStoreManager";
import { StoreManager } from "../../../utilities/StoreManager.svelte";
import { ElectroCardiogramService } from "../../../services/health/ElectroCardiogramService";
import StatCard from "./StatCard.svelte";

let { actor = null } = $props();
const storeManager: IStoreManager = StoreManager.Instance as IStoreManager;

// Store references (using .value suffix as per data model)
let stunStore = $state<Writable<number> | null>(null);
let physicalStore = $state<Writable<number> | null>(null);
let penaltyStore = $state<Writable<number> | null>(null);
let overflowStore = $state<Writable<number> | null>(null);
let miraculousSurvivalStore = $state<Writable<boolean> | null>(null);
let aliveStore = $state<Writable<boolean> | null>(null);

// Local reactive values for display
let stunValue = $state(0);
let physicalValue = $state(0);
let penaltyValue = $state(0);
let overflowValue = $state(0);
let miraculousSurvivalValue = $state(true);
let aliveValue = $state(true);

// Local state
let stunBoxes = $state<boolean[]>(Array(10).fill(false));
let physicalBoxes = $state<boolean[]>(Array(10).fill(false));

// ECG canvas references
let ecgCanvas: HTMLCanvasElement;
let ecgPointCanvas: HTMLCanvasElement;
let ecgContainer: HTMLElement;
let ecgService: ElectroCardiogramService | null = null;

const localization = $derived(CONFIG.SR3E.HEALTH);
const severityLabels = ["light", "medium", "serious", "deadly"];
const severityIndices = [0, 2, 5, 9];

// Initialize ECG service on mount
onMount(() => {
	if (ecgCanvas && ecgPointCanvas && ecgContainer) {
		ecgService = new ElectroCardiogramService(
			ecgCanvas,
			ecgPointCanvas,
			ecgContainer
		);
	}

	return () => {
		ecgService?.destroy();
	};
});

// Initialize stores and subscriptions
$effect(() => {
	if (!actor) return;

	storeManager.Subscribe(actor);

	// Initialize health stores (with .value suffix as per data model)
	stunStore = storeManager.GetRWStore<number>(actor, "health.stun.value");
	physicalStore = storeManager.GetRWStore<number>(actor, "health.physical.value");
	penaltyStore = storeManager.GetRWStore<number>(actor, "health.penalty.value");
	overflowStore = storeManager.GetRWStore<number>(actor, "health.overflow.value");
	miraculousSurvivalStore = storeManager.GetFlagStore<boolean>(actor, "miraculousSurvival", true);
	aliveStore = storeManager.GetRWStore<boolean>(actor, "health.alive");

	return () => {
		storeManager.Unsubscribe(actor);
	};
});

// Sync store values to local state for display
$effect(() => {
	if (stunStore) stunValue = $stunStore ?? 0;
});
$effect(() => {
	if (physicalStore) physicalValue = $physicalStore ?? 0;
});
$effect(() => {
	if (penaltyStore) penaltyValue = $penaltyStore ?? 0;
});
$effect(() => {
	if (overflowStore) overflowValue = $overflowStore ?? 0;
});
$effect(() => {
	if (miraculousSurvivalStore) miraculousSurvivalValue = $miraculousSurvivalStore ?? true;
});
$effect(() => {
	if (aliveStore) aliveValue = $aliveStore ?? true;
});

// Update checkbox arrays when store values change
$effect(() => {
	stunBoxes = Array(10).fill(false).map((_, i) => i < stunValue);
	physicalBoxes = Array(10).fill(false).map((_, i) => i < physicalValue);
});

// Update ECG pace and calculate penalty based on damage
$effect(() => {
	if (!penaltyStore || !ecgService) return;

	// Calculate penalty and update ECG pace
	const penalty = ecgService.calculatePenalty(stunValue, physicalValue);
	penaltyStore.set(penalty);
});

// Handle death state (flatline)
$effect(() => {
	if (!ecgService) return;

	if (!aliveValue) {
		ecgService.flatline();
	} else {
		ecgService.resume();
	}
});

function toggle(type: "stun" | "physical", index: number) {
	if (!stunStore || !physicalStore) return;

	if (type === "stun") {
		const newValue = index < stunValue ? index : index + 1;
		stunStore.set(newValue);
	} else {
		const newValue = index < physicalValue ? index : index + 1;
		physicalStore.set(newValue);
	}
}

function incrementOverflow() {
	if (!overflowStore) return;
	if (overflowValue < 10) {
		overflowStore.set(overflowValue + 1);
	}
}

function decrementOverflow() {
	if (!overflowStore) return;
	if (overflowValue > 0) {
		overflowStore.set(overflowValue - 1);
	}
}

async function revive() {
	if (!miraculousSurvivalStore || !overflowStore || !aliveStore) return;

	if (!miraculousSurvivalValue) return;

	const confirmed = await foundry.applications.api.DialogV2.confirm({
		window: { title: localize(localization.miraculousSurvival) },
		content: `<p>${localize(localization.reviveConfirm)}</p>`,
		yes: { label: localize(localization.revive) },
		no: { label: "Cancel" }
	});

	if (confirmed) {
		miraculousSurvivalStore.set(false);
		overflowStore.set(0);
		aliveStore.set(true);
	}
}

function handleButtonKeypress(e: KeyboardEvent, callback: () => void) {
	if (e.key === "Enter" || e.key === " ") {
		e.preventDefault();
		callback();
	}
}

function localize(key: string): string {
	return game.i18n.localize(key);
}
</script>

{#if actor && stunStore && physicalStore && penaltyStore && overflowStore}
	<!-- ECG Visualization -->
	<div bind:this={ecgContainer} class="ecg-container">
		<canvas bind:this={ecgCanvas} id="ecg-canvas" class="ecg-animation"></canvas>
		<canvas bind:this={ecgPointCanvas} id="ecg-point-canvas"></canvas>
		<div class="left-gradient"></div>
		<div class="right-gradient"></div>
	</div>

	<div class="condition-monitor">
		<div class="condition-meter">
			<!-- Revival Button -->
			{#if !miraculousSurvivalValue}
				<div class="revival-button">
					<i
						class="fa-solid fa-heart-circle-bolt"
						role="button"
						tabindex="0"
						aria-label="Revive"
						onclick={revive}
						onkeydown={(e) => handleButtonKeypress(e, revive)}
					></i>
				</div>
			{/if}

			<!-- Stun Damage Track -->
			<div class="stun-damage">
				<h3 class="no-margin checkbox-label">{localize(localization?.stun || "SR3E.health.stun")}</h3>
				{#each stunBoxes as checked, i}
					<div class="damage-input">
						<input
							class="checkbox"
							type="checkbox"
							id={`healthBox${i + 1}`}
							{checked}
							onchange={() => toggle("stun", i)}
						/>
						{#if severityIndices.includes(i)}
							<div class="damage-description stun">
								<h4 class={`no-margin ${checked ? "lit" : "unlit"}`}>
									{localize(localization[severityLabels[severityIndices.indexOf(i)] as keyof typeof localization])}
								</h4>
							</div>
						{/if}
					</div>
				{/each}
			</div>

			<!-- Physical Damage Track -->
			<div class="physical-damage">
				<h3 class="no-margin checkbox-label">{localize(localization?.physical || "SR3E.health.physical")}</h3>
				{#each physicalBoxes as checked, i}
					<div class="damage-input">
						<input
							class="checkbox"
							type="checkbox"
							id={`healthBox${i + 11}`}
							{checked}
							onchange={() => toggle("physical", i)}
						/>
						{#if severityIndices.includes(i)}
							<div class="damage-description physical">
								<h4 class={`no-margin ${checked ? "lit" : "unlit"}`}>
									{localize(localization[severityLabels[severityIndices.indexOf(i)] as keyof typeof localization])}
								</h4>
							</div>
						{/if}
					</div>
				{/each}

				<!-- Overflow Controls inline with physical damage -->
				<div class="damage-control">
					<div class="overflow-button">
						<i
							class="fa-solid fa-plus"
							role="button"
							tabindex="0"
							aria-label="Increase overflow"
							onclick={incrementOverflow}
							onkeydown={(e) => handleButtonKeypress(e, incrementOverflow)}
						></i>
					</div>
				</div>

				<div class="damage-control">
					<div class="overflow-button">
						<i
							class="fa-solid fa-minus"
							role="button"
							tabindex="0"
							aria-label="Decrease overflow"
							onclick={decrementOverflow}
							onkeydown={(e) => handleButtonKeypress(e, decrementOverflow)}
						></i>
					</div>
				</div>
			</div>
		</div>

		<!-- Stat Cards -->
		<div class="health-card-container">
			<div class="stat-grid single-column">
				<StatCard label={localize(localization?.penalty || "SR3E.health.penalty")}>
					<span class="attribute-value">{penaltyValue}</span>
				</StatCard>
				<StatCard label={localize(localization?.overflow || "SR3E.health.overflow")}>
					<span class="attribute-value">{overflowValue}</span>
				</StatCard>
			</div>
		</div>
	</div>
{:else}
	<p>Provide an actor to initialize Health.</p>
{/if}
