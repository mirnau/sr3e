<script lang="ts">
import type { Writable } from "svelte/store";
import type { IStoreManager } from "../../../utilities/IStoreManager";
import { StoreManager } from "../../../utilities/StoreManager.svelte";

let { actor = null, storeManager = StoreManager.Instance as IStoreManager } = $props();

// Store references
let stunStore = $state<Writable<number> | null>(null);
let physicalStore = $state<Writable<number> | null>(null);
let penaltyStore = $state<Writable<number> | null>(null);
let overflowStore = $state<Writable<number> | null>(null);
let miraculousSurvivalStore = $state<Writable<boolean> | null>(null);
let aliveStore = $state<Writable<boolean> | null>(null);

// Local state
let stunBoxes = $state<boolean[]>(Array(10).fill(false));
let physicalBoxes = $state<boolean[]>(Array(10).fill(false));

const localization = $derived(CONFIG.SR3E.HEALTH);
const severityLabels = ["light", "medium", "serious", "deadly"];
const severityIndices = [0, 2, 5, 9];

// Initialize stores and subscriptions
$effect(() => {
	if (!actor) return;

	storeManager.Subscribe(actor);

	// Initialize health stores
	stunStore = storeManager.GetRWStore<number>(actor, "health.stun");
	physicalStore = storeManager.GetRWStore<number>(actor, "health.physical");
	penaltyStore = storeManager.GetRWStore<number>(actor, "health.penalty");
	overflowStore = storeManager.GetRWStore<number>(actor, "health.overflow");
	miraculousSurvivalStore = storeManager.GetFlagStore<boolean>(actor, "miraculousSurvival", true);
	aliveStore = storeManager.GetRWStore<boolean>(actor, "health.alive");

	return () => {
		storeManager.Unsubscribe(actor);
	};
});

// Update checkbox arrays when store values change
$effect(() => {
	if (!stunStore || !physicalStore) return;

	const stunValue = $stunStore ?? 0;
	const physicalValue = $physicalStore ?? 0;

	stunBoxes = Array(10).fill(false).map((_, i) => i < stunValue);
	physicalBoxes = Array(10).fill(false).map((_, i) => i < physicalValue);
});

// Calculate penalty based on damage
$effect(() => {
	if (!stunStore || !physicalStore || !penaltyStore) return;

	const stunValue = $stunStore ?? 0;
	const physicalValue = $physicalStore ?? 0;
	const maxDamage = Math.max(stunValue, physicalValue);

	let penalty = 0;
	if (maxDamage >= 3 && maxDamage <= 5) penalty = -1;
	else if (maxDamage >= 6 && maxDamage <= 9) penalty = -2;
	else if (maxDamage >= 10) penalty = -3;

	penaltyStore.set(penalty);
});

function toggle(type: "stun" | "physical", index: number) {
	if (!stunStore || !physicalStore) return;

	if (type === "stun") {
		const currentValue = $stunStore ?? 0;
		const newValue = index < currentValue ? index : index + 1;
		stunStore.set(newValue);
	} else {
		const currentValue = $physicalStore ?? 0;
		const newValue = index < currentValue ? index : index + 1;
		physicalStore.set(newValue);
	}
}

function incrementOverflow() {
	if (!overflowStore) return;
	const current = $overflowStore ?? 0;
	if (current < 10) {
		overflowStore.set(current + 1);
	}
}

function decrementOverflow() {
	if (!overflowStore) return;
	const current = $overflowStore ?? 0;
	if (current > 0) {
		overflowStore.set(current - 1);
	}
}

async function revive() {
	if (!miraculousSurvivalStore || !overflowStore || !aliveStore) return;

	const canRevive = $miraculousSurvivalStore;
	if (!canRevive) return;

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
	<div class="health-card-container">
		<h1>{localize(localization?.health || "SR3E.health.health")}</h1>

		<!-- ECG Visualization Placeholder -->
		<div class="ecg-container">
			<canvas id="ecg-canvas" width="400" height="100"></canvas>
		</div>

		<div class="condition-monitor">
			<!-- Stun Damage Track -->
			<div class="damage-track stun-track condition-meter">
				<h3>{localize(localization?.stun || "SR3E.health.stun")}</h3>
				<div class="damage-boxes stun-damage">
					{#each stunBoxes as checked, i}
						<label class={`damage-box ${checked ? "lit" : "unlit"}`}>
							<input
								class="checkbox"
								type="checkbox"
								checked={checked}
								onchange={() => toggle("stun", i)}
							/>
							<span class="box-number">{i + 1}</span>
							{#if severityIndices.includes(i)}
								<span class={`severity-label ${checked ? "lit" : "unlit"}`}>
									{localize(localization[severityLabels[severityIndices.indexOf(i)] as keyof typeof localization])}
								</span>
							{/if}
						</label>
					{/each}
				</div>
			</div>

			<!-- Physical Damage Track -->
			<div class="damage-track physical-track condition-meter">
				<h3>{localize(localization?.physical || "SR3E.health.physical")}</h3>
				<div class="damage-boxes physical-damage">
					{#each physicalBoxes as checked, i}
						<label class={`damage-box ${checked ? "lit" : "unlit"}`}>
							<input
								class="checkbox"
								type="checkbox"
								checked={checked}
								onchange={() => toggle("physical", i)}
							/>
							<span class="box-number">{i + 1}</span>
							{#if severityIndices.includes(i)}
								<span class={`severity-label ${checked ? "lit" : "unlit"}`}>
									{localize(localization[severityLabels[severityIndices.indexOf(i)] as keyof typeof localization])}
								</span>
							{/if}
						</label>
					{/each}
				</div>
			</div>
		</div>

		<!-- Overflow Controls -->
		<div class="overflow-controls damage-control">
			<h3>{localize(localization?.overflow || "SR3E.health.overflow")}</h3>
			<div class="overflow-buttons">
				<button
					type="button"
					class="overflow-btn overflow-button"
					onclick={decrementOverflow}
					onkeypress={(e) => handleButtonKeypress(e, decrementOverflow)}
					aria-label="Decrease overflow"
				>
					<i class="fas fa-minus"></i>
				</button>
				<span class="overflow-value">{$overflowStore ?? 0}</span>
				<button
					type="button"
					class="overflow-btn overflow-button"
					onclick={incrementOverflow}
					onkeypress={(e) => handleButtonKeypress(e, incrementOverflow)}
					aria-label="Increase overflow"
				>
					<i class="fas fa-plus"></i>
				</button>
			</div>
		</div>

		<!-- Revival Button -->
		{#if miraculousSurvivalStore && $miraculousSurvivalStore && ($overflowStore ?? 0) > 0}
			<button
				type="button"
				class="revive-button revival-button"
				onclick={revive}
			>
				<i class="fas fa-heart"></i>
				{localize(localization.miraculousSurvival || "SR3E.health.miraculousSurvival")}
			</button>
		{/if}

		<!-- Stat Cards -->
		<div class="health-stats">
			<div class="stat-card health-card" data-key="penalty">
				<strong>{localize(localization?.penalty || "SR3E.health.penalty")}</strong>
				<span class="stat-value">{$penaltyStore ?? 0}</span>
			</div>

			<div class="stat-card health-card" data-key="overflow">
				<strong>{localize(localization?.overflow || "SR3E.health.overflow")}</strong>
				<span class="stat-value">{$overflowStore ?? 0}</span>
			</div>
		</div>
	</div>
{:else}
	<p>Provide an actor to initialize Health.</p>
{/if}
