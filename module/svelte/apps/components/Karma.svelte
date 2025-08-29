<script>
   import { localize } from "@services/utilities.js";
   import { setupMasonry } from "../../../foundry/masonry/responsiveMasonry.js";
   import { shoppingState } from "../../../svelteStore.js";
   import { masonryMinWidthFallbackValue } from "@services/commonConsts.js";
   import CardToolbar from "./CardToolbar.svelte";
   import MasonryGrid from "./basic/MasonryGrid.svelte";
   import StatCard from "./basic/DerivedAttributeCard.svelte";
   import { StoreManager } from "../../svelteHelpers/StoreManager.svelte.js";
   import { flags } from "@services/commonConsts.js";
   import { derived } from "svelte/store";

   let { actor = {}, config = {}, id = {}, span = {} } = $props();
   let storeManager = StoreManager.Subscribe(actor);
   let isShoppingState = storeManager.GetFlagStore(flags.actor.isShoppingState);

   let karmaPoolStore = storeManager.GetSumROStore("karma.karmaPool");
   let goodKarmaStore = storeManager.GetRWStore("karma.goodKarma");
   // Aggregated preview provided by AttributeKarmaShopping strategies
   let shoppingKarmaSession = storeManager.GetShallowStore(actor.id, "shoppingKarmaSession", { active: false, baseline: 0, stagedSpent: 0 });
   let goodKarmaDisplay = derived([
      isShoppingState,
      shoppingKarmaSession,
      goodKarmaStore
   ], ([$shopping, $session, $good]) => {
      if ($shopping && $session?.active) return ($session.baseline ?? 0) - ($session.stagedSpent ?? 0);
      return $good ?? 0;
   });
   let essenceStore = storeManager.GetSumROStore("attributes.essence");

</script>

<CardToolbar {id} />
<h1>{localize(config.karma.karma)}</h1>
<MasonryGrid itemSelector="stat-card" gridPrefix="attribute">
   <StatCard {actor} label={localize(config.karma.goodkarma)} value={$goodKarmaDisplay} />
   <StatCard {actor} label={localize(config.karma.karmapool)} value={$karmaPoolStore.sum} />
   <StatCard {actor} label={localize(config.attributes.essence)} value={$essenceStore.sum} />
</MasonryGrid>
