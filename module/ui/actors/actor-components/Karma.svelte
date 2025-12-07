<script lang="ts">
import { derived } from "svelte/store";
import type { Writable, Readable } from "svelte/store";
import type { IStoreManager } from "../../../utilities/IStoreManager";
import { StoreManager } from "../../../utilities/StoreManager.svelte";

let { actor = null } = $props();
const storeManager: IStoreManager = StoreManager.Instance as IStoreManager;

// Store references
let karmaPoolStore = $state<Readable<number> | null>(null);
let goodKarmaStore = $state<Writable<number> | null>(null);
let goodKarmaDisplay = $state<Readable<number> | null>(null);
let essenceStore = $state<Readable<number> | null>(null);
let isShoppingState = $state<Writable<boolean> | null>(null);
let shoppingKarmaSession = $state<Writable<any> | null>(null);

const localization = $derived(CONFIG.SR3E.KARMA);
const attributesLocalization = $derived(CONFIG.SR3E.ATTRIBUTES);

// Helper to create a sum store for karma (value + modifier)
function createKarmaSumStore(actor: any, karmaPath: string): Readable<number> {
	const valueStore = storeManager.GetRWStore<number>(actor, `${karmaPath}.value`);
	const modifierStore = storeManager.GetRWStore<number>(actor, `${karmaPath}.modifier`);
	return storeManager.GetSumROStore([valueStore, modifierStore]);
}

// Helper to create a sum store for an attribute (value + modifier)
function createAttributeSumStore(actor: any, attrPath: string): Readable<number> {
	const valueStore = storeManager.GetRWStore<number>(actor, `${attrPath}.value`);
	const modifierStore = storeManager.GetRWStore<number>(actor, `${attrPath}.modifier`);
	return storeManager.GetSumROStore([valueStore, modifierStore]);
}

// Initialize stores and subscriptions
$effect(() => {
	if (!actor) return;

	storeManager.Subscribe(actor);

	// Initialize karma stores
	karmaPoolStore = createKarmaSumStore(actor, "karma.karmaPool");
	goodKarmaStore = storeManager.GetRWStore<number>(actor, "karma.goodKarma");

	// Initialize essence store
	essenceStore = createAttributeSumStore(actor, "attributes.essence");

	// Initialize flag and shallow stores
	isShoppingState = storeManager.GetFlagStore<boolean>(actor, "isShoppingState", false);
	shoppingKarmaSession = storeManager.GetShallowStore<any>(
		actor,
		"shoppingKarmaSession",
		{ active: false, baseline: 0, stagedSpent: 0 }
	);

	// Create derived store for good karma display with shopping preview
	goodKarmaDisplay = derived(
		[isShoppingState, shoppingKarmaSession, goodKarmaStore],
		([$shopping, $session, $good]) => {
			if ($shopping && $session?.active) {
				return ($session.baseline ?? 0) - ($session.stagedSpent ?? 0);
			}
			return $good ?? 0;
		}
	);

	return () => {
		storeManager.Unsubscribe(actor);
	};
});

function localize(key: string): string {
	return game.i18n.localize(key);
}
</script>

{#if actor && karmaPoolStore && goodKarmaDisplay && essenceStore}
	<h1>{localize(localization.karma)}</h1>
	<div class="masonry-grid" data-item-selector="stat-card" data-grid-prefix="attribute">
		<!-- Good Karma -->
		<div class="stat-card karma-card" data-key="goodkarma">
			<strong>{localize(localization.goodKarma)}</strong>
			<span class="karma-value">{$goodKarmaDisplay ?? 0}</span>
		</div>

		<!-- Karma Pool -->
		<div class="stat-card karma-card" data-key="karmapool">
			<strong>{localize(localization?.karmaPool)}</strong>
			<span class="karma-value">{$karmaPoolStore ?? 0}</span>
		</div>

		<!-- Essence -->
		<div class="stat-card karma-card" data-key="essence">
			<strong>{localize(attributesLocalization.essence)}</strong>
			<span class="karma-value">{$essenceStore ?? 0}</span>
		</div>
	</div>
{:else}
	<p>Provide an actor to initialize Karma.</p>
{/if}
