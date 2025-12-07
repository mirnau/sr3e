<script lang="ts">
import type { Writable, Readable } from "svelte/store";
import type { IStoreManager } from "../../../utilities/IStoreManager";
import { StoreManager } from "../../../utilities/StoreManager.svelte";

let { actor = null } = $props();
const storeManager: IStoreManager = StoreManager.Instance as IStoreManager;

// Store references
let quicknessStore = $state<Readable<number> | null>(null);
let walking = $state<Readable<number> | null>(null);
let walkingValue = $state<Writable<number> | null>(null);
let running = $state<Readable<number> | null>(null);
let runningValue = $state<Writable<number> | null>(null);
let isShoppingState = $state<Writable<boolean> | null>(null);
let attributePreview = $state<Writable<any> | null>(null);

const localization = $derived(CONFIG.SR3E.MOVEMENT);
const metatype = $derived(actor?.items.find((i: any) => i.type === "metatype"));

// Helper to create a sum store for an attribute (value + modifier)
function createAttributeSumStore(actor: any, attrPath: string): Readable<number> {
	const valueStore = storeManager.GetRWStore<number>(actor, `${attrPath}.value`);
	const modifierStore = storeManager.GetRWStore<number>(actor, `${attrPath}.modifier`);
	return storeManager.GetSumROStore([valueStore, modifierStore]);
}

// Helper to create a sum store for movement (value + modifier)
function createMovementSumStore(actor: any, movementPath: string): Readable<number> {
	const valueStore = storeManager.GetRWStore<number>(actor, `${movementPath}.value`);
	const modifierStore = storeManager.GetRWStore<number>(actor, `${movementPath}.modifier`);
	return storeManager.GetSumROStore([valueStore, modifierStore]);
}

// Initialize stores and subscriptions
$effect(() => {
	if (!actor) return;

	storeManager.Subscribe(actor);

	// Initialize attribute and movement stores
	quicknessStore = createAttributeSumStore(actor, "attributes.quickness");

	walking = createMovementSumStore(actor, "movement.walking");
	walkingValue = storeManager.GetRWStore<number>(actor, "movement.walking.value");

	running = createMovementSumStore(actor, "movement.running");
	runningValue = storeManager.GetRWStore<number>(actor, "movement.running.value");

	// Initialize flag and shallow stores
	isShoppingState = storeManager.GetFlagStore<boolean>(actor, "isShoppingState", false);
	attributePreview = storeManager.GetShallowStore<any>(actor, "shoppingAttributePreview", { active: false, values: {} });

	return () => {
		storeManager.Unsubscribe(actor);
	};
});

// Calculate movement speeds based on quickness and metatype
$effect(() => {
	if (!actor || !quicknessStore || !walkingValue || !runningValue || !isShoppingState || !attributePreview) return;
	if (!metatype) return;

	const runningMod = metatype.system?.movement?.factor ?? 3;
	const quicknessSum = $quicknessStore ?? 0;

	const quicknessPreview = $isShoppingState
		? ($attributePreview?.values?.quickness ?? quicknessSum)
		: quicknessSum;

	walkingValue.set(quicknessPreview);
	runningValue.set(Math.floor(quicknessPreview * runningMod));
});

function localize(key: string): string {
	return game.i18n.localize(key);
}
</script>

{#if actor && walking && running}
	<h1>{localize(localization.movement || "SR3E.movement.movement")}</h1>
	<div class="masonry-grid" data-item-selector="stat-card" data-grid-prefix="attribute">
		<!-- Walking Speed -->
		<div class="stat-card movement-card" data-key="walking">
			<strong>{localize(localization?.walking || "SR3E.movement.walking")}</strong>
			<span class="movement-value">{$walking ?? 0}</span>
		</div>

		<!-- Running Speed -->
		<div class="stat-card movement-card" data-key="running">
			<strong>{localize(localization?.running || "SR3E.movement.running")}</strong>
			<span class="movement-value">{$running ?? 0}</span>
		</div>
	</div>
{:else}
	<p>Provide an actor to initialize Movement.</p>
{/if}
