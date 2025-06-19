<script>
  import masonry from "masonry-layout";
  import { setupMasonry } from "../../../../foundry/masonry/responsiveMasonry.js";
  import { masonryMinWidthFallbackValue } from "../../../../foundry/services/commonConsts.js";

  let { itemSelector: itemSelector = "", gridPrefix = "", children } = $props();
  let gridContainer;
  let masonryInstance;

  $effect(() => {
    masonryInstance?.Destroy();

    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const result = setupMasonry({
      container: gridContainer,
      itemSelector: `.${itemSelector}`,
      gridSizerSelector: `.${gridPrefix}-grid-sizer`,
      gutterSizerSelector: `.${gridPrefix}-gutter-sizer`,
      minItemWidth: masonryMinWidthFallbackValue.attributeGrid * rem,
    });

    masonryInstance = result.masonryInstance;
    return result.cleanup;
  });
</script>

<div bind:this={gridContainer} class={`${gridPrefix}-masonry-grid`}>
  <div class={`${gridPrefix}-grid-sizer`}></div>
  <div class={`${gridPrefix}-gutter-sizer`}></div>
  {@render children?.()}
</div>
