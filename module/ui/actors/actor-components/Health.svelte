<script lang="ts">
import type { Writable } from "svelte/store";
import { onDestroy } from "svelte";
import type { IStoreManager } from "../../../utilities/IStoreManager";
import { StoreManager } from "../../../utilities/StoreManager.svelte";
import { ElectroCardiogramService } from "../../../services/health/ElectroCardiogramService";
import StatCard from "./StatCard.svelte";

let { actor = null } = $props();
const storeManager: IStoreManager = StoreManager.Instance as IStoreManager;

// Store references
let stun = $state<Writable<number> | null>(null);
let physical = $state<Writable<number> | null>(null);
let penalty = $state<Writable<number> | null>(null);
let overflow = $state<Writable<number> | null>(null);
let miraculousSurvival = $state<Writable<boolean> | null>(null);
let isAlive = $state<Writable<boolean> | null>(null);

// ECG canvas references (use $state for reactivity with bind:this)
let ecgCanvas = $state<HTMLCanvasElement | null>(null);
let ecgPointCanvas = $state<HTMLCanvasElement | null>(null);
let ecgContainer = $state<HTMLElement | null>(null);
let ecgService = $state<ElectroCardiogramService | null>(null);

// Local state for checkbox arrays
let stunBoxes = $state<boolean[]>([]);
let physicalBoxes = $state<boolean[]>([]);

const localization = $derived(CONFIG.SR3E.HEALTH);
const severityLabels = ["light", "medium", "serious", "deadly"];
const severityIndices = [0, 2, 5, 9];

// Initialize stores and subscriptions
$effect(() => {
	if (!actor) return;

	storeManager.Subscribe(actor);

	// Initialize health stores
	stun = storeManager.GetRWStore<number>(actor, "health.stun.value");
	physical = storeManager.GetRWStore<number>(actor, "health.physical.value");
	penalty = storeManager.GetRWStore<number>(actor, "health.penalty.value");
	overflow = storeManager.GetRWStore<number>(actor, "health.overflow.value");
	miraculousSurvival = storeManager.GetFlagStore<boolean>(actor, "miraculousSurvival", false);
	isAlive = storeManager.GetRWStore<boolean>(actor, "health.isAlive");

	return () => {
		storeManager.Unsubscribe(actor);
	};
});

// Update checkbox arrays when damage values change
$effect(() => {
	if (!stun || !physical) return;
	stunBoxes = Array.from({ length: 10 }, (_, i) => i < ($stun ?? 0));
	physicalBoxes = Array.from({ length: 10 }, (_, i) => i < ($physical ?? 0));
});

// Initialize ECG service when canvas elements are ready
$effect(() => {
	if (ecgCanvas && ecgPointCanvas && ecgContainer && !ecgService) {
		ecgService = new ElectroCardiogramService(
			ecgCanvas,
			ecgPointCanvas,
			ecgContainer
		);
	}
});

// Handle death state (flatline)
$effect(() => {
	if (!ecgService || !isAlive) return;

	if (!$isAlive) {
		ecgService.flatline();
	} else {
		ecgService.resume();
	}
});

// Calculate penalty when damage changes
$effect(() => {
	if (!ecgService || !stun || !physical || !penalty) return;
	const calculatedPenalty = ecgService.calculatePenalty($stun ?? 0, $physical ?? 0);
	penalty.set(calculatedPenalty);
});

// Cleanup on destroy
onDestroy(() => {
	ecgService?.destroy();
});

function toggle(localIndex: number, isStun: boolean, willBeChecked: boolean) {
	const newValue = willBeChecked ? localIndex + 1 : localIndex;
	if (isStun && stun) {
		stun.set(newValue);
	} else if (physical) {
		physical.set(newValue);
	}
}

function incrementOverflow() {
	if (!overflow) return;
	overflow.set(Math.min(($overflow ?? 0) + 1, 10));
}

function decrementOverflow() {
	if (!overflow) return;
	overflow.set(Math.max(($overflow ?? 0) - 1, 0));
}

async function revive() {
	if (!overflow || !isAlive || !miraculousSurvival) return;

	const confirmed = await foundry.applications.api.DialogV2.confirm({
		window: { title: localize(localization?.miraculousSurvival || "SR3E.health.miraculousSurvival") },
		content: `<p>${localize(localization?.reviveConfirm || "SR3E.health.reviveConfirm")}</p>`,
		yes: { label: localize(localization?.revive || "SR3E.health.revive") },
		no: { label: "Cancel" }
	});

	if (confirmed) {
		overflow.set(0);
		isAlive.set(true);
		miraculousSurvival.set(true);
	}
}

function handleButtonKeypress(e: KeyboardEvent, fn: () => void) {
	if (e.key === "Enter" || e.key === " ") {
		e.preventDefault();
		fn();
	}
}

function localize(key: string): string {
	return game.i18n.localize(key);
}
</script>

{#if actor && stun && physical && penalty && overflow}
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
			{#if miraculousSurvival && !$miraculousSurvival}
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
							onchange={(e) => toggle(i, true, (e.target as HTMLInputElement).checked)}
						/>
						{#if severityIndices.includes(i)}
							<div class="damage-description stun">
								<h4 class={`no-margin ${checked ? "lit" : "unlit"}`}>
									{localize(localization?.[severityLabels[severityIndices.indexOf(i)] as keyof typeof localization] || "")}
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
							onchange={(e) => toggle(i, false, (e.target as HTMLInputElement).checked)}
						/>
						{#if severityIndices.includes(i)}
							<div class="damage-description physical">
								<h4 class={`no-margin ${checked ? "lit" : "unlit"}`}>
									{localize(localization?.[severityLabels[severityIndices.indexOf(i)] as keyof typeof localization] || "")}
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
					<span class="attribute-value">{$penalty ?? 0}</span>
				</StatCard>
				<StatCard label={localize(localization?.overflow || "SR3E.health.overflow")}>
					<span class="attribute-value">{$overflow ?? 0}</span>
				</StatCard>
			</div>
		</div>
	</div>
{:else}
	<p>Provide an actor to initialize Health.</p>
{/if}
