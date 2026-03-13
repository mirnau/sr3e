<script lang="ts">
import { derived } from "svelte/store";
import type { Writable, Readable } from "svelte/store";
import type { IStoreManager } from "../../../utilities/IStoreManager";
import { StoreManager } from "../../../utilities/StoreManager.svelte";
import StatCard from "./StatCard.svelte";

let { actor = null } = $props();
const storeManager: IStoreManager = StoreManager.Instance as IStoreManager;

// Store references
let lifetimeKarmaStore = $state<Readable<number> | null>(null);
let goodKarmaStore = $state<Writable<number> | null>(null);
let goodKarmaDisplay = $state<Readable<number> | null>(null);
let isShoppingState = $state<Writable<boolean> | null>(null);
let shoppingKarmaSession = $state<Writable<any> | null>(null);

const localization = $derived(CONFIG.SR3E.KARMA);

// Initialize stores and subscriptions
$effect(() => {
	if (!actor) return;

	storeManager.Subscribe(actor);

	lifetimeKarmaStore = storeManager.GetRWStore<number>(actor, "karma.lifetimeKarma");
	goodKarmaStore = storeManager.GetRWStore<number>(actor, "karma.goodKarma");

	isShoppingState = storeManager.GetFlagStore<boolean>(actor, "isShoppingState", false);
	shoppingKarmaSession = storeManager.GetShallowStore<any>(
		actor,
		"shoppingKarmaSession",
		{ active: false, stagedSpent: 0, attrSnapshot: {} }
	);

	// Display Good Karma minus any staged (uncommitted) spend
	goodKarmaDisplay = derived(
		[isShoppingState, shoppingKarmaSession, goodKarmaStore],
		([$shopping, $session, $good]) => {
			if ($shopping && $session?.active) {
				return ($good ?? 0) - ($session?.stagedSpent ?? 0);
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

{#if actor && lifetimeKarmaStore && goodKarmaDisplay}
	<h1>{localize(localization.karma)}</h1>
	<div class="stat-card-grid">
		<!-- Lifetime Karma (total earned) -->
		<StatCard label={localize(localization.karma)}>
			<span class="attribute-value">{$lifetimeKarmaStore ?? 0}</span>
		</StatCard>

		<!-- Good Karma (unspent, shows staged deduction during shopping) -->
		<StatCard label={localize(localization.goodKarma)}>
			<span class="attribute-value">{$goodKarmaDisplay ?? 0}</span>
		</StatCard>
	</div>
{:else}
	<p>Provide an actor to initialize Karma.</p>
{/if}
