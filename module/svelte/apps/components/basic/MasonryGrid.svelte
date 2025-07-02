<script>
  import masonry from "masonry-layout";
  import { setupMasonry } from "../../../../foundry/masonry/responsiveMasonry.js";
  import { masonryMinWidthFallbackValue } from "../../../../services/commonConsts.js";
  import { tick } from "svelte";

  let { itemSelector: itemSelector = "", gridPrefix = "", children } = $props();
  let gridContainer;
  let masonryInstance;

  $effect(() => {
    if (!masonryInstance) {
      const rem = parseFloat(
        getComputedStyle(document.documentElement).fontSize
      );
      const result = setupMasonry({
        container: gridContainer,
        itemSelector: `.${itemSelector}`,
        gridSizerSelector: `.${gridPrefix}-grid-sizer`,
        gutterSizerSelector: `.${gridPrefix}-gutter-sizer`,
        //minItemWidth: masonryMinWidthFallbackValue.attributeGrid * rem,
      });

      masonryInstance = result.masonryInstance;
      return result.cleanup;
    }
  });

  $effect(async () => {
    gridContainer?.dispatchEvent(
      new CustomEvent("masonry-reflow", { bubbles: true })
    );
  });
</script>

<div
  bind:this={gridContainer}
  class={`${gridPrefix}-masonry-grid`}
  onmasonry-reflow={() => {
    masonryInstance.layout();
  }}
>
  <div class={`${gridPrefix}-grid-sizer`}></div>
  <div class={`${gridPrefix}-gutter-sizer`}></div>
  {@render children?.()}
</div>
