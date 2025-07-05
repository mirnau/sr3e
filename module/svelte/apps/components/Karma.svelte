<script>
   import { localize } from "../../../services/utilities.js";
   import { setupMasonry } from "../../../foundry/masonry/responsiveMasonry.js";
   import { shoppingState } from "../../../svelteStore.js";
   import { masonryMinWidthFallbackValue } from "../../../services/commonConsts.js";
   import CardToolbar from "./CardToolbar.svelte";
   import MasonryGrid from "./basic/MasonryGrid.svelte";
   import StatCard from "./basic/StatCard.svelte";
   import { StoreManager } from "../../svelteHelpers/StoreManager.svelte.js";

   let { actor = {}, config = {}, id = {}, span = {} } = $props();
   let storeManager = StoreManager.Subscribe(actor);

   let karmaPoolStore = storeManager.GetRWStore("karma.karmaPool");
   let goodKarmaStore = storeManager.GetRWStore("karma.goodKarma");
   let essenceStore = storeManager.GetSumROStore("attributes.essence");
   let miraculousSurvivalStore = storeManager.GetRWStore("karma.miraculousSurvival");
</script>

<CardToolbar {id} />
<h1>{localize(config.karma.karma)}</h1>
<MasonryGrid itemSelector="stat-card" gridPrefix="attribute">
   <StatCard label={localize(config.karma.goodkarma)} value={$goodKarmaStore} />
   <StatCard label={localize(config.karma.karmapool)} value={$karmaPoolStore} />
   <StatCard label={localize(config.attributes.essence)} value={$essenceStore.sum} />

   {#if !$miraculousSurvivalStore}
      <div class="stat-card">
         <div class="stat-card-background"></div>
         <h4 class="no-margin">
            {localize(config.karma.miraculoussurvival)}
         </h4>
         <i class="fa-solid fa-heart-circle-bolt"></i>
      </div>
   {:else}
      <!--display nothing-->
   {/if}
</MasonryGrid>
