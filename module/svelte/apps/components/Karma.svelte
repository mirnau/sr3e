<script>
  import { localize } from "../../../svelteHelpers.js";
  import { setupMasonry } from "../../../foundry/masonry/responsiveMasonry.js";
  import { shoppingState } from "../../../svelteStore.js";
  import CardToolbar from "./CardToolbar.svelte";
  import { masonryMinWidthFallbackValue } from "../../../foundry/services/commonConsts.js";

  let { actor = {}, config = {}, id = {}, span = {} } = $props();
  let karma = $state(actor.system.karma);
  let essence = $state(actor.system.attributes.essence ?? 0);
  let gridContainer;
  let survivor = $derived(karma.miraculoussurvival);

  $effect(() => {
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const result = setupMasonry({
      container: gridContainer,
      itemSelector: ".stat-card",
      gridSizerSelector: ".attribute-grid-sizer",
      gutterSizerSelector: ".attribute-gutter-sizer",
      minItemWidth: masonryMinWidthFallbackValue.attributeGrid * rem,
    });
    return result.cleanup;
  });
</script>

<CardToolbar {id} />
<h1>{localize(config.karma.karma)}</h1>
<div bind:this={gridContainer} class="attribute-masonry-grid">
  <div class="attribute-grid-sizer"></div>
  <div class="attribute-gutter-sizer"></div>

  <div class="stat-card">
    <div class="stat-card-background"></div>
    <h4 class="no-margin">{localize(config.karma.goodkarma)}</h4>
    <h1 class="stat-value">
      {karma.goodkarma}
    </h1>
  </div>

  <div class="stat-card">
    <div class="stat-card-background"></div>
    <h4 class="no-margin">{localize(config.karma.karmaPool)}</h4>
    <h1 class="stat-value">
      {karma.karmaPool}
    </h1>
  </div>

  <div class="stat-card">
    <div class="stat-card-background"></div>
    <h4 class="no-margin">{localize(config.attributes.essence)}</h4>
    <h1 class="stat-value">
      {essence}
    </h1>
  </div>

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
</div>
