<script lang="ts">
import type { Writable, Readable } from "svelte/store";
import type { IStoreManager } from "../../../utilities/IStoreManager";
import { StoreManager } from "../../../utilities/StoreManager.svelte";

let { actor = null, storeManager = StoreManager.Instance as IStoreManager } = $props();

let isAwakened = $state(false);
let hasMatrixInterface = $state(false);
let hasRiggerInterface = $state(false);
let itemsUpdateTick = $state(0);

// Store references
let intelligence = $state<Readable<number> | null>(null);
let willpower = $state<Readable<number> | null>(null);
let charisma = $state<Readable<number> | null>(null);
let quickness = $state<Readable<number> | null>(null);
let reaction = $state<Readable<number> | null>(null);
let magic = $state<Readable<number> | null>(null);

let combat = $state<Readable<number> | null>(null);
let combatValueStore = $state<Writable<number> | null>(null);

let control = $state<Readable<number> | null>(null);
let controlValueStore = $state<Writable<number> | null>(null);

let hacking = $state<Readable<number> | null>(null);
let hackingValueStore = $state<Writable<number> | null>(null);

let astral = $state<Readable<number> | null>(null);
let astralValueStore = $state<Writable<number> | null>(null);

let spell = $state<Readable<number> | null>(null);
let spellValueStore = $state<Writable<number> | null>(null);

let isShoppingState = $state<Writable<boolean> | null>(null);
let attributePreview = $state<Writable<any> | null>(null);

const localization = $derived(CONFIG.SR3E.DICE_POOLS);

// Helper to create a sum store for an attribute (value + modifier)
function createAttributeSumStore(actor: any, attrPath: string): Readable<number> {
	const valueStore = storeManager.GetRWStore<number>(actor, `${attrPath}.value`);
	const modifierStore = storeManager.GetRWStore<number>(actor, `${attrPath}.modifier`);
	return storeManager.GetSumROStore([valueStore, modifierStore]);
}

// Helper to create a sum store for a dice pool (value + modifier)
function createDicePoolSumStore(actor: any, poolPath: string): Readable<number> {
	const valueStore = storeManager.GetRWStore<number>(actor, `${poolPath}.value`);
	const modifierStore = storeManager.GetRWStore<number>(actor, `${poolPath}.modifier`);
	return storeManager.GetSumROStore([valueStore, modifierStore]);
}

// Initialize stores and subscriptions
$effect(() => {
	if (!actor) return;

	storeManager.Subscribe(actor);

	// Initialize attribute sum stores
	intelligence = createAttributeSumStore(actor, "attributes.intelligence");
	willpower = createAttributeSumStore(actor, "attributes.willpower");
	charisma = createAttributeSumStore(actor, "attributes.charisma");
	quickness = createAttributeSumStore(actor, "attributes.quickness");
	reaction = createAttributeSumStore(actor, "attributes.reaction");
	magic = createAttributeSumStore(actor, "attributes.magic");

	// Initialize dice pool sum stores
	combat = createDicePoolSumStore(actor, "dicePools.combat");
	combatValueStore = storeManager.GetRWStore<number>(actor, "dicePools.combat.value");

	control = createDicePoolSumStore(actor, "dicePools.control");
	controlValueStore = storeManager.GetRWStore<number>(actor, "dicePools.control.value");

	hacking = createDicePoolSumStore(actor, "dicePools.hacking");
	hackingValueStore = storeManager.GetRWStore<number>(actor, "dicePools.hacking.value");

	astral = createDicePoolSumStore(actor, "dicePools.astral");
	astralValueStore = storeManager.GetRWStore<number>(actor, "dicePools.astral.value");

	spell = createDicePoolSumStore(actor, "dicePools.spell");
	spellValueStore = storeManager.GetRWStore<number>(actor, "dicePools.spell.value");

	// Initialize flag and shallow stores
	isShoppingState = storeManager.GetFlagStore<boolean>(actor, "isShoppingState", false);
	attributePreview = storeManager.GetShallowStore<any>(actor, "shoppingAttributePreview", { active: false, values: {} });

	// Setup item collection listeners
	const collection = actor.items?.collection;
	const bump = () => (itemsUpdateTick = itemsUpdateTick + 1);

	if (collection) {
		collection.on("update", bump);
		collection.on("create", bump);
		collection.on("delete", bump);
	}

	const bumpHook = (doc: any) => {
		if (doc?.parent?.id === actor?.id) bump();
	};

	Hooks.on("updateItem", bumpHook);
	Hooks.on("createItem", bumpHook);
	Hooks.on("deleteItem", bumpHook);

	return () => {
		if (collection) {
			collection.off("update", bump);
			collection.off("create", bump);
			collection.off("delete", bump);
		}
		Hooks.off("updateItem", bumpHook);
		Hooks.off("createItem", bumpHook);
		Hooks.off("deleteItem", bumpHook);
		storeManager.Unsubscribe(actor);
	};
});

// Check if character is awakened
$effect(() => {
	if (!actor) return;
	isAwakened = actor.items.some((item: any) => item.type === "magic") && !actor.system?.attributes?.magic?.isBurnedOut;
});

// Calculate dice pool values
$effect(() => {
	if (!intelligence || !quickness || !willpower || !charisma || !magic || !isShoppingState || !attributePreview) return;
	if (!combatValueStore || !astralValueStore || !spellValueStore || !controlValueStore) return;

	const previewOrFallback = (key: string, fallback: number) =>
		$isShoppingState ? ($attributePreview?.values?.[key] ?? fallback) : fallback;

	const intelligenceValue = previewOrFallback("intelligence", $intelligence ?? 0);
	const quicknessValue = previewOrFallback("quickness", $quickness ?? 0);
	const willpowerValue = previewOrFallback("willpower", $willpower ?? 0);
	const charismaValue = previewOrFallback("charisma", $charisma ?? 0);
	const magicValue = previewOrFallback("magic", $magic ?? 0);
	const reactionPreview = Math.floor((intelligenceValue + quicknessValue) * 0.5);

	controlValueStore.set(reactionPreview);
	combatValueStore.set(Math.floor((intelligenceValue + quicknessValue + willpowerValue) * 0.5));
	astralValueStore.set(Math.floor((intelligenceValue + charismaValue + willpowerValue) * 0.5));
	spellValueStore.set(Math.floor((intelligenceValue + magicValue + willpowerValue) / 3));
});

// Calculate hacking pool (requires equipped cyberdeck/terminal)
$effect(() => {
	if (!actor || !intelligence || !hackingValueStore) return;

	itemsUpdateTick; // Ensure reactivity dependency
	const intSum = $intelligence ?? 0;

	const equipped = actor.items.find((it: any) =>
		it?.type === "techinterface" &&
		(it.system?.subtype === "cyberdeck" || it.system?.subtype === "cyberterminal") &&
		it.getFlag && it.getFlag("sr3e", "isEquipped")
	);

	if (!equipped) {
		hasMatrixInterface = false;
		hackingValueStore.set(0);
		return;
	}

	hasMatrixInterface = true;
	const mpcp = Number(equipped.system?.matrix?.mpcp ?? 0) || 0;
	const computed = Math.floor((Number(intSum || 0) + mpcp) / 3);
	hackingValueStore.set(computed);
});

// Calculate control pool (requires equipped RC deck)
$effect(() => {
	if (!actor || !reaction || !controlValueStore) return;

	itemsUpdateTick; // Ensure reactivity dependency
	const reactionSum = $reaction ?? 0;

	const rcDeck = actor.items.find((it: any) =>
		it?.type === "techinterface" &&
		it.system?.subtype === "rcdeck" &&
		it.getFlag && it.getFlag("sr3e", "isEquipped")
	);

	if (!rcDeck) {
		hasRiggerInterface = false;
		controlValueStore.set(0);
		return;
	}

	hasRiggerInterface = true;
	const vcrRating = Number(actor.getFlag?.("sr3e", "vcrRating") ?? 0) || 0;
	const computed = Number(reactionSum || 0) + vcrRating * 2;
	controlValueStore.set(computed);
});

function localize(key: string): string {
	return game.i18n.localize(key);
}
</script>

{#if actor && combat && control && hacking && astral && spell}
	<h1>{localize(localization.dicePools || "SR3E.dicepools.dicepools")}</h1>
	<div class="masonry-grid" data-item-selector="stat-card" data-grid-prefix="attribute">
		<!-- Combat Pool - always shown -->
		<div class="stat-card dice-pool-card" data-key="combat">
			<button type="button" class="dice-pool-button">
				<strong>{localize(localization?.combat || "SR3E.dicepools.combat")}</strong>
				<span class="pool-value">{$combat ?? 0}</span>
			</button>
		</div>

		<!-- Control Pool - shown if has rigger interface -->
		{#if hasRiggerInterface}
			<div class="stat-card dice-pool-card" data-key="control">
				<button type="button" class="dice-pool-button">
					<strong>{localize(localization?.control || "SR3E.dicepools.control")}</strong>
					<span class="pool-value">{$control ?? 0}</span>
				</button>
			</div>
		{/if}

		<!-- Hacking Pool - shown if has matrix interface -->
		{#if hasMatrixInterface}
			<div class="stat-card dice-pool-card" data-key="hacking">
				<button type="button" class="dice-pool-button">
					<strong>{localize(localization?.hacking || "SR3E.dicepools.hacking")}</strong>
					<span class="pool-value">{$hacking ?? 0}</span>
				</button>
			</div>
		{/if}

		<!-- Astral and Spell Pools - shown if awakened -->
		{#if isAwakened}
			<div class="stat-card dice-pool-card" data-key="astral">
				<button type="button" class="dice-pool-button">
					<strong>{localize(localization?.astral || "SR3E.dicepools.astral")}</strong>
					<span class="pool-value">{$astral ?? 0}</span>
				</button>
			</div>

			<div class="stat-card dice-pool-card" data-key="spell">
				<button type="button" class="dice-pool-button">
					<strong>{localize(localization?.spell || "SR3E.dicepools.spell")}</strong>
					<span class="pool-value">{$spell ?? 0}</span>
				</button>
			</div>
		{/if}
	</div>
{:else}
	<p>Provide an actor to initialize Dice Pools.</p>
{/if}
