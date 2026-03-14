<script lang="ts">
import { onDestroy } from "svelte";
import { derived } from "svelte/store";
import type { Readable } from "svelte/store";
import { localize } from "../../../services/utilities";
import type { IStoreManager } from "../../../utilities/IStoreManager";
import { StoreManager } from "../../../utilities/StoreManager.svelte";
import StatCard from "./StatCard.svelte";

let { actor }: { actor: Actor } = $props();
const storeManager: IStoreManager = StoreManager.Instance as IStoreManager;

const localization = $derived(CONFIG.SR3E.KARMA);

storeManager.Subscribe(actor);

const lifetimeKarmaStore = storeManager.GetRWStore<number>(actor, "karma.lifetimeKarma");
const goodKarmaStore = storeManager.GetRWStore<number>(actor, "karma.goodKarma");
const isShoppingState = storeManager.GetFlagStore<boolean>(actor, "isShoppingState", false);
const shoppingKarmaSession = storeManager.GetShallowStore<any>(actor, "shoppingKarmaSession", { active: false, stagedSpent: 0, attrSnapshot: {} });

const goodKarmaDisplay: Readable<number> = derived(
   [isShoppingState, shoppingKarmaSession, goodKarmaStore],
   ([$shopping, $session, $good]) => {
      if ($shopping && $session?.active) {
         return ($good ?? 0) - ($session?.stagedSpent ?? 0);
      }
      return $good ?? 0;
   }
);

onDestroy(() => storeManager.Unsubscribe(actor));
</script>

{#if actor}
   <h1>{localize(localization.karma)}</h1>
   <div class="stat-card-grid">
<StatCard label={localize(localization.karma)}>
         <span class="attribute-value">{$lifetimeKarmaStore ?? 0}</span>
      </StatCard>
<StatCard label={localize(localization.goodKarma)}>
         <span class="attribute-value">{$goodKarmaDisplay ?? 0}</span>
      </StatCard>
   </div>
{:else}
   <p>Provide an actor to initialize Karma.</p>
{/if}
