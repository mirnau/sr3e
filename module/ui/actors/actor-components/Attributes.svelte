<script lang="ts">
import type { Readable } from "svelte/store";
import type { IStoreManager } from "../../../utilities/IStoreManager";
import { StoreManager } from "../../../utilities/StoreManager.svelte";
import { FLAGS } from "../../../constants/flags";
import { AttributeSpendingService } from "../../../services/character-creation/AttributeSpendingService";

let { actor = null } = $props();
const storeManager: IStoreManager = StoreManager.Instance as IStoreManager;

let isAwakened = $state(false);

// Attribute sum stores - will be initialized in $effect
let intelligence = $state<Readable<number> | null>(null);
let quickness = $state<Readable<number> | null>(null);
let magic = $state<Readable<number> | null>(null);
let essence = $state<Readable<number> | null>(null);
let reaction = $state<Readable<number> | null>(null);

let attributes = $derived(actor?.system?.attributes || {});
let attributeKeys = $derived(Object.keys(attributes).slice(0, 7));

const localization = $derived(CONFIG.SR3E.ATTRIBUTES);

// Creation mode flag stores (for chevron visibility)
const isCharacterCreation = $derived(
	actor ? storeManager.GetFlagStore(actor, FLAGS.ACTOR.IS_CHARACTER_CREATION, false) : null
);
const attributeLocked = $derived(
	actor ? storeManager.GetFlagStore(actor, FLAGS.ACTOR.ATTRIBUTE_ASSIGNMENT_LOCKED, false) : null
);
const actorStore = $derived(actor ? storeManager.GetROStore(actor) : null);

// Attribute spending service
const spendingService = AttributeSpendingService.Instance();

// Show chevrons only in creation mode when attributes not locked
const showChevrons = $derived(() => {
	if (!isCharacterCreation || !attributeLocked) return false;
	const inCreation = $isCharacterCreation;
	const locked = $attributeLocked;
	return inCreation && !locked;
});

// Helper to create a sum store for an attribute (value + modifier)
function createAttributeSumStore(actor: any, attrPath: string): Readable<number> {
	const valueStore = storeManager.GetRWStore<number>(actor, `${attrPath}.value`);
	const modifierStore = storeManager.GetRWStore<number>(actor, `${attrPath}.modifier`);
	return storeManager.GetSumROStore([valueStore, modifierStore]);
}

$effect(() => {
	if (!actor) return;

	storeManager.Subscribe(actor);

	// Initialize attribute sum stores
	intelligence = createAttributeSumStore(actor, "attributes.intelligence");
	quickness = createAttributeSumStore(actor, "attributes.quickness");
	magic = createAttributeSumStore(actor, "attributes.magic");
	essence = createAttributeSumStore(actor, "attributes.essence");
	reaction = createAttributeSumStore(actor, "attributes.reaction");

	return () => {
		storeManager.Unsubscribe(actor);
	};
});

// Update reaction based on intelligence and quickness
$effect(() => {
	if (!actor || !intelligence || !quickness) return;

	const intelSum = $intelligence ?? 0;
	const quickSum = $quickness ?? 0;
	const reactionVal = Math.floor((intelSum + quickSum) * 0.5);

	// Update the reaction value store
	const reactionValueStore = storeManager.GetRWStore<number>(actor, "attributes.reaction.value");
	reactionValueStore.set(reactionVal);
});

// Check if character is awakened
$effect(() => {
	if (!actor) return;
	isAwakened = actor.items.some((item: any) => item.type === "magic") && !actor.system?.attributes?.magic?.isBurnedOut;
});

function localize(key: string): string {
	return game.i18n.localize(key);
}

// Chevron validation helpers (trigger reactivity with actorStore)
function canIncrease(key: string): boolean {
	if (!actor || !actorStore) return false;
	$actorStore; // Trigger reactivity
	return spendingService.canIncreaseAttribute(actor, key);
}

function canDecrease(key: string): boolean {
	if (!actor || !actorStore) return false;
	$actorStore; // Trigger reactivity
	return spendingService.canDecreaseAttribute(actor, key);
}

// Chevron click handlers
async function increaseAttribute(key: string) {
	if (!actor) return;
	await spendingService.increaseAttribute(actor, key);
}

async function decreaseAttribute(key: string) {
	if (!actor) return;
	await spendingService.decreaseAttribute(actor, key);
}
</script>

{#if actor}
	<h1>{localize(localization?.attributes || "SR3E.attributes.attributes")}</h1>
	<div class="masonry-grid" data-item-selector="stat-card" data-grid-prefix="attribute">
		{#each attributeKeys as key}
			<div class="stat-card" data-key={key}>
				<strong>{localize(localization[key as keyof typeof localization])}</strong>
				<div class="attribute-value-row">
					{#if showChevrons()}
						<button
							type="button"
							class="attr-chevron attr-chevron-down"
							disabled={!canDecrease(key)}
							onclick={() => decreaseAttribute(key)}
							title="Decrease {key}"
							aria-label="Decrease {key}"
						>
							<i class="fa-solid fa-chevron-down"></i>
						</button>
					{/if}
					<span class="attribute-value">{attributes[key].value || 0}</span>
					{#if showChevrons()}
						<button
							type="button"
							class="attr-chevron attr-chevron-up"
							disabled={!canIncrease(key)}
							onclick={() => increaseAttribute(key)}
							title="Increase {key}"
							aria-label="Increase {key}"
						>
							<i class="fa-solid fa-chevron-up"></i>
						</button>
					{/if}
				</div>
			</div>
		{/each}

		{#if isAwakened}
			<div class="stat-card" data-key="magic">
				<strong>{localize(localization?.magic || "SR3E.attributes.magic")}</strong>
				<div class="attribute-value-row">
					{#if showChevrons()}
						<button
							type="button"
							class="attr-chevron attr-chevron-down"
							disabled={!canDecrease("magic")}
							onclick={() => decreaseAttribute("magic")}
							title="Decrease magic"
							aria-label="Decrease magic"
						>
							<i class="fa-solid fa-chevron-down"></i>
						</button>
					{/if}
					<span class="attribute-value">{attributes.magic?.value || 0}</span>
					{#if showChevrons()}
						<button
							type="button"
							class="attr-chevron attr-chevron-up"
							disabled={!canIncrease("magic")}
							onclick={() => increaseAttribute("magic")}
							title="Increase magic"
							aria-label="Increase magic"
						>
							<i class="fa-solid fa-chevron-up"></i>
						</button>
					{/if}
				</div>
			</div>
		{/if}
	</div>
{:else}
	<p>Provide an actor to initialize Attributes.</p>
{/if}

<style>
	.attribute-value-row {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 4px;
	}

	.attribute-value {
		min-width: 24px;
		text-align: center;
		font-size: 1.2em;
		font-weight: bold;
	}

	.attr-chevron {
		background: transparent;
		border: 1px solid rgba(0, 255, 0, 0.3);
		border-radius: 3px;
		padding: 2px 6px;
		cursor: pointer;
		color: #0f0;
		font-size: 0.8em;
		transition: all 0.2s ease;
	}

	.attr-chevron:hover:not(:disabled) {
		background: rgba(0, 255, 0, 0.2);
		border-color: rgba(0, 255, 0, 0.6);
		filter: drop-shadow(0 0 4px rgba(0, 255, 0, 0.5));
	}

	.attr-chevron:disabled {
		opacity: 0.3;
		cursor: not-allowed;
		color: #666;
		border-color: rgba(100, 100, 100, 0.3);
	}

	.attr-chevron i {
		pointer-events: none;
	}
</style>
