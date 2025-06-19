<script>
  import { localize } from "../../../svelteHelpers.js";
  import { setupMasonry } from "../../../foundry/masonry/responsiveMasonry.js";
  import { shoppingState } from "../../../svelteStore.js";
  import { masonryMinWidthFallbackValue } from "../../../foundry/services/commonConsts.js";
  import CardToolbar from "./CardToolbar.svelte";
  import MasonryGrid from "./basic/MasonryGrid.svelte";
  import StatCard from "./basic/StatCard.svelte";

  let { actor = {}, config = {}, id = {}, span = {} } = $props();
  let karma = $state(actor.system.karma);
  let essence = $state(actor.system.attributes.essence ?? 0);
  let survivor = $derived(karma.miraculoussurvival);

</script>

<CardToolbar {id} />
<h1>{localize(config.karma.karma)}</h1>
<MasonryGrid itemSelector="stat-card" gridPrefix="attribute">

  <StatCard label={localize(config.karma.goodkarma)} value={karma.goodKarma}/>
  <StatCard label={localize(config.karma.karmapool)} value={karma.karmaPool}/>
  <StatCard label={localize(config.attributes.essence)} value={essence}/>

  {#if !survivor}
    <div class="stat-card">
      <div class="stat-card-background"></div>
      <h4 class="no-margin">
        {localize(config.karma.miraculoussurvival)}
      </h4>
      <h5 class="stat-value">
        <i class="fa-solid fa-heart-circle-bolt"></i>
      </h5>
    </div>
  {:else}
    <!--display nothing-->
  {/if}
</MasonryGrid>
