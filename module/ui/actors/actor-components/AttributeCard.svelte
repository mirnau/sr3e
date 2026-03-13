<script lang="ts">
import type { Writable } from "svelte/store";
import type { IStoreManager } from "../../../utilities/IStoreManager";
import { StoreManager } from "../../../utilities/StoreManager.svelte";
import { FLAGS } from "../../../constants/flags";
import { AttributeSpendingService } from "../../../services/character-creation/AttributeSpendingService";
import { KarmaSpendingService } from "../../../services/karma/KarmaSpendingService";

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
const isShoppingState = $derived(
	actor ? storeManager.GetFlagStore<boolean>(actor, FLAGS.ACTOR.IS_SHOPPING_STATE, false) : null
);

// Karma mode: shopping is ON and character creation is OFF
const isKarmaMode = $derived(
	!!(isShoppingState && isCharacterCreation && $isShoppingState && !$isCharacterCreation)
);

// Creation points store for reactivity on point changes
const creationPointsStore = $derived<Writable<number> | null>(
	actor ? storeManager.GetRWStore<number>(actor, "creation.attributePoints") : null
);

// Attribute spending service
const spendingService = AttributeSpendingService.Instance();

// Derived attributes that cannot be bought with points or karma
const isDerivedAttribute = $derived(
	attributeKey === "reaction" ||
	attributeKey === "essence" ||
	attributeKey === "magic" ||
	attributeKey === "initiative"
);

// Show chevrons in creation mode (when attrs not locked) or in karma mode
const showChevrons = $derived(() => {
	if (isDerivedAttribute) return false;
	return (
		(!!isCharacterCreation && !!attributeLocked && $isCharacterCreation && !$attributeLocked) ||
		isKarmaMode
	);
});

// Chevron validation helpers (trigger reactivity via stores)
function canIncrease(): boolean {
	if (!actor || !attributeValueStore) return false;
	$attributeValueStore; // reactive touch
	if (isKarmaMode) {
		return KarmaSpendingService.Instance().canStageAttrIncrement(actor, attributeKey);
	}
	$creationPointsStore;
	return spendingService.canIncreaseAttribute(actor, attributeKey);
}

function canDecrease(): boolean {
	if (!actor || !attributeValueStore) return false;
	$attributeValueStore; // reactive touch
	if (isKarmaMode) {
		return KarmaSpendingService.Instance().canStageAttrDecrement(actor, attributeKey);
	}
	return spendingService.canDecreaseAttribute(actor, attributeKey);
}

// Chevron click handlers (synchronous - store updates are handled by service)
function increaseAttribute(): void {
	if (!actor) return;
	if (isKarmaMode) {
		if (!KarmaSpendingService.Instance().canStageAttrIncrement(actor, attributeKey)) return;
		KarmaSpendingService.Instance().stageAttrIncrement(actor, attributeKey);
		return;
	}
	spendingService.increaseAttribute(actor, attributeKey);
}

function decreaseAttribute(): void {
	if (!actor) return;
	if (isKarmaMode) {
		if (!KarmaSpendingService.Instance().canStageAttrDecrement(actor, attributeKey)) return;
		KarmaSpendingService.Instance().stageAttrDecrement(actor, attributeKey);
		return;
	}
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