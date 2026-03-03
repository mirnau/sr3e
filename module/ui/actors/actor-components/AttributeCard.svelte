<script lang="ts">
import type { Writable } from "svelte/store";
import type { IStoreManager } from "../../../utilities/IStoreManager";
import { StoreManager } from "../../../utilities/StoreManager.svelte";
import { FLAGS } from "../../../constants/flags";
import { AttributeSpendingService } from "../../../services/character-creation/AttributeSpendingService";

interface Props {
	actor: Actor | null;
	attributeKey: string;
	label: string;
}

let { actor = null, attributeKey, label }: Props = $props();
const storeManager: IStoreManager = StoreManager.Instance as IStoreManager;

// Get attribute value store for reactivity
const attributeValueStore = $derived<Writable<number> | null>(
	actor ? storeManager.GetRWStore<number>(actor, `attributes.${attributeKey}.value`) : null
);

// Creation mode flag stores (for chevron visibility)
const isCharacterCreation = $derived(
	actor ? storeManager.GetFlagStore(actor, FLAGS.ACTOR.IS_CHARACTER_CREATION, false) : null
);
const attributeLocked = $derived(
	actor ? storeManager.GetFlagStore(actor, FLAGS.ACTOR.ATTRIBUTE_ASSIGNMENT_LOCKED, false) : null
);

// Creation points store for reactivity on point changes
const creationPointsStore = $derived<Writable<number> | null>(
	actor ? storeManager.GetRWStore<number>(actor, "creation.attributePoints") : null
);

// Attribute spending service
const spendingService = AttributeSpendingService.Instance();

// Derived attributes that cannot be bought with points
const isDerivedAttribute = $derived(attributeKey === "reaction" || attributeKey === "essence");

// Show chevrons only in creation mode when attributes not locked, and not for derived attributes
const showChevrons = $derived(() => {
	if (isDerivedAttribute) return false;
	if (!isCharacterCreation || !attributeLocked) return false;
	const inCreation = $isCharacterCreation;
	const locked = $attributeLocked;
	return inCreation && !locked;
});

// Chevron validation helpers (trigger reactivity via stores)
function canIncrease(): boolean {
	if (!actor || !attributeValueStore || !creationPointsStore) return false;
	// Touch stores to trigger reactivity
	$attributeValueStore;
	$creationPointsStore;
	return spendingService.canIncreaseAttribute(actor, attributeKey);
}

function canDecrease(): boolean {
	if (!actor || !attributeValueStore) return false;
	// Touch store to trigger reactivity
	$attributeValueStore;
	return spendingService.canDecreaseAttribute(actor, attributeKey);
}

// Chevron click handlers (synchronous - store updates are handled by service)
function increaseAttribute() {
	if (!actor) return;
	spendingService.increaseAttribute(actor, attributeKey);
}

function decreaseAttribute() {
	if (!actor) return;
	spendingService.decreaseAttribute(actor, attributeKey);
}
</script>

<div class="attribute-card">
	<div class="attribute-card-shadow"></div>
	<div class="attribute-card-outline">
		<div class="attribute-card-displayarea"></div>
		<h4 class="attribute-label">{label}</h4>
		<div class="attribute-value-row">
			{#if showChevrons()}
				<button
					type="button"
					class="attr-chevron attr-chevron-down"
					disabled={!canDecrease()}
					onclick={() => decreaseAttribute()}
					title="Decrease {attributeKey}"
					aria-label="Decrease {attributeKey}"
				>
					<i class="fa-solid fa-circle-chevron-down"></i>
				</button>
			{/if}
			<span class="attribute-value">{attributeValueStore ? $attributeValueStore : 0}</span>
			{#if showChevrons()}
				<button
					type="button"
					class="attr-chevron attr-chevron-up"
					disabled={!canIncrease()}
					onclick={() => increaseAttribute()}
					title="Increase {attributeKey}"
					aria-label="Increase {attributeKey}"
				>
					<i class="fa-solid fa-circle-chevron-up"></i>
				</button>
			{/if}
		</div>
	</div>
</div>