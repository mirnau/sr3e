<script lang="ts">
import type { Readable } from "svelte/store";
import type { IStoreManager } from "../../../utilities/IStoreManager";
import { StoreManager } from "../../../utilities/StoreManager.svelte";

let { actor = null, storeManager = StoreManager.Instance as IStoreManager } = $props();

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
</script>

{#if actor}
	<h1>{localize(localization?.attributes || "SR3E.attributes.attributes")}</h1>
	<div class="masonry-grid" data-item-selector="stat-card" data-grid-prefix="attribute">
		{#each attributeKeys as key}
			<!-- AttributeCard component placeholder - will need to be created separately -->
			<div class="stat-card" data-key={key}>
				<strong>{localize(localization[key as keyof typeof localization])}</strong>
				<span>{attributes[key].value || 0}</span>
			</div>
		{/each}

		{#if isAwakened}
			<div class="stat-card" data-key="magic">
				<strong>{localize(localization?.magic || "SR3E.attributes.magic")}</strong>
				<span>{attributes.magic?.value || 0}</span>
			</div>
		{/if}
	</div>
{:else}
	<p>Provide an actor to initialize Attributes.</p>
{/if}
