<script>
  import { localize } from "../../../svelteHelpers.js";
  import { setupMasonry } from "../../../foundry/masonry/responsiveMasonry.js";
  import { masonryMinWidthFallbackValue } from "../../../foundry/services/commonConsts.js";
  import StatCard from "./basic/StatCard.svelte";

  let { actor = {}, config = {}, id = {}, span = {} } = $props();
  let gridContainer;

  let attributes = $state(actor.system.attributes);

  let intelligenceBaseTotal = $derived(
    attributes.intelligence.value + attributes.intelligence.mod
  );
  let intelligence = $derived(
    intelligenceBaseTotal + (attributes.intelligence.meta ?? 0)
  );

  let quicknessBaseTotal = $derived(
    attributes.quickness.value + attributes.quickness.mod
  );
  let quickness = $derived(
    quicknessBaseTotal + (attributes.quickness.meta ?? 0)
  );

  let reaction = $derived(Math.floor(intelligence + quickness * 0.5));
  let augmentedReaction = $derived(reaction);

  let initiativeDice = 1;

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

<div>
  <h1>{localize(config.initiative.initiative)}</h1>
  <div bind:this={gridContainer} class="attribute-masonry-grid">
    <div class="attribute-grid-sizer"></div>
    <div class="attribute-gutter-sizer"></div>
    <StatCard label={config.initiative.initiativeDice} value={initiativeDice} />
    <StatCard label={config.initiative.reaction} value={reaction} />
    <StatCard label={config.initiative.augmentedReaction} value={augmentedReaction} />
  </div>
</div>
