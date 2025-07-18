<script>
   import { localize } from "../../../services/utilities.js";
   import { masonryMinWidthFallbackValue } from "../../../services/commonConsts.js";
   import CardToolbar from "./CardToolbar.svelte";
   import MasonryGrid from "./basic/MasonryGrid.svelte";
   import StatCard from "./basic/StatCard.svelte";
   import { StoreManager } from "../../svelteHelpers/StoreManager.svelte.js";

   let { actor, config, id, span } = $props();

   const storeManager = StoreManager.Subscribe(actor);

   const karmaPoolStore = storeManager.GetRWStore("karma.karmaPool");
   const goodKarmaStore = storeManager.GetRWStore("karma.goodKarma");
   const essenceStore = storeManager.GetRWStore("attributes.essence");
   const miraculousSurvivalStore = storeManager.GetRWStore("karma.miraculousSurvival");
</script>

<CardToolbar {id} />
<h1>{localize(config.karma.karma)}</h1>

<MasonryGrid itemSelector="stat-card" gridPrefix="attribute">
   <StatCard {actor} label={localize(config.karma.goodkarma)} value={$goodKarmaStore} />
   <StatCard {actor} label={localize(config.karma.karmapool)} value={$karmaPoolStore} />
   <StatCard {actor} label={localize(config.attributes.essence)} value={$essenceStore} />

   {#if !$miraculousSurvivalStore}
      <div class="stat-card">
         <div class="stat-card-background"></div>
         <h4 class="no-margin">
            {localize(config.karma.miraculoussurvival)}
         </h4>
         <i class="fa-solid fa-heart-circle-bolt"></i>
      </div>
   {/if}
</MasonryGrid>
