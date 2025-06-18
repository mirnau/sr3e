<script>
  import StatCard from "./basic/StatCard.svelte";
  import { localize } from "../../../svelteHelpers.js";
  import { setupMasonry } from "../../../foundry/masonry/responsiveMasonry.js";
  import { shoppingState } from "../../../svelteStore.js";
  import CardToolbar from "./CardToolbar.svelte";
  import { masonryMinWidthFallbackValue } from "../../../foundry/services/commonConsts.js";

  let { actor = {}, config = {}, id = {}, span = {} } = $props();
  let dicePools = $state(actor.system.dicePools);
  let localization = config.dicepools;

  let gridContainer;
  const isShoppingState = false;

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
<h1>{localize(config.dicepools.dicepools)}</h1>
<div bind:this={gridContainer} class="attribute-masonry-grid">
  <div class="attribute-grid-sizer"></div>
  <div class="attribute-gutter-sizer"></div>
  {#each Object.entries(dicePools) as [key, stat]}
    <StatCard label={config.dicepools[key]} value={stat.value} />
  {/each}
</div>
