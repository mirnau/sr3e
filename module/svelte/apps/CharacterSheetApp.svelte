<script>
  import Masonry from "masonry-layout";
  import Dossier from "./components/Dossier.svelte";
  import Attributes from "./components/Attributes.svelte";
  import Skills from "./components/Skills.svelte";
  import Health from "./components/Health.svelte";
  import Inventory from "./components/Inventory.svelte";

  let { actor, config, form } = $props();
  const cards = $state([
    { id: 0, comp: Dossier, props: { actor, config } },
    { id: 1, comp: Attributes, props: { actor, config } },
    { id: 2, comp: Skills, props: { actor, config } },
    { id: 3, comp: Health, props: { actor, config } },
    { id: 4, comp: Inventory, props: { actor, config } },
    { id: 5, txt: "Testing Databind" },
    { id: 6, txt: "Testing Databind" },
    { id: 7, txt: "Testing Databind" },
    { id: 8, txt: "Testing Databind" },
    { id: 9, txt: "Testing Databind" },
  ]);
  let container = null;
  let mason = null;
  let resizeObserver = null;
  let formWidth = $state(0);
  let formHeight = $state(0);

  // State machine thresholds
  const maxWidth = 1400;
  const lowerLimit = 0.5 * maxWidth;
  const middleLimit = 0.66 * maxWidth;

  // Layout state: "small", "medium", "wide"
  let layoutState = $derived(() => {
    if (formWidth > middleLimit) return "wide";
    if (formWidth > lowerLimit) return "medium";
    return "small";
  });

  function calcAndApplyColumnWidths() {
    if (!container || !form) return;

    // Get padding (if your form/container has padding)
    const style = getComputedStyle(form);
    const parentPadding = parseFloat(style.paddingLeft) || 0;
    const parentWidth = form.offsetWidth - 2 * parentPadding;

    // Gutter: get from your .layout-gutter-sizer (Masonry expects an actual DOM element)
    const gutterEl = container.querySelector(".layout-gutter-sizer");
    const gutterPx = gutterEl
      ? parseFloat(getComputedStyle(gutterEl).width)
      : 20;

    // Min item width: read from first grid item or default
    const firstItem = container.querySelector(".sheet-component");
    const minItemWidthPx = firstItem
      ? parseFloat(getComputedStyle(firstItem).minWidth) || 220
      : 220;

    // Calculate columns (always at least 1)
    let columnCount = Math.floor(
      (parentWidth + gutterPx) / (minItemWidthPx + gutterPx),
    );
    columnCount = Math.max(columnCount, 1);

    // Calculate item width
    const totalGutterWidthPx = gutterPx * (columnCount - 1);
    const itemWidthPx = (parentWidth - totalGutterWidthPx) / columnCount;
    const adjustedItemWidthPx = Math.floor(itemWidthPx);

    // Apply width to all grid items (default single-span)
    container.querySelectorAll(".sheet-component").forEach((item) => {
      item.style.width = `${adjustedItemWidthPx}px`;
    });

    // Apply width to the grid sizer
    const sizer = container.querySelector(".layout-grid-sizer");
    if (sizer) sizer.style.width = `${adjustedItemWidthPx}px`;

    // --- Responsive state machine logic for multi-span items ---
    const twoSpan = container.querySelectorAll(".two-span-selectable");
    const threeSpan = container.querySelectorAll(".three-span-selectable");
    if (layoutState === "small") {
      twoSpan.forEach((c) => (c.style.width = `${adjustedItemWidthPx}px`));
      threeSpan.forEach((c) => (c.style.width = `${adjustedItemWidthPx}px`));
    } else if (layoutState === "medium") {
      twoSpan.forEach(
        (c) =>
          (c.style.width = `calc(${2 * adjustedItemWidthPx}px + ${gutterPx}px)`),
      );
      threeSpan.forEach((c) => (c.style.width = `${adjustedItemWidthPx}px`));
    } else if (layoutState === "wide") {
      twoSpan.forEach(
        (c) =>
          (c.style.width = `calc(${2 * adjustedItemWidthPx}px + ${gutterPx}px)`),
      );
      threeSpan.forEach(
        (c) =>
          (c.style.width = `calc(${3 * adjustedItemWidthPx}px + ${2 * gutterPx}px)`),
      );
    }
  }

  // Initial Masonry/layout setup and resize observer
  $effect(() => {
    calcAndApplyColumnWidths();

    mason = new Masonry(container, {
      itemSelector: ".sheet-component",
      columnWidth: ".layout-grid-sizer",
      gutter: ".layout-gutter-sizer",
      percentPosition: true,
    });

    mason.reloadItems();
    mason.layout();

    resizeObserver = new ResizeObserver(() => {
      calcAndApplyColumnWidths();
      mason.reloadItems();
      mason.layout();
      formWidth = form.offsetWidth;
      formHeight = form.offsetHeight;
    });
    resizeObserver.observe(form);

    const itemObservers = [];

    container.querySelectorAll(".sheet-component").forEach((item) => {
      const obs = new ResizeObserver(() => {
        mason.reloadItems();
        mason.layout();
      });
      obs.observe(item);
      itemObservers.push(obs);
    });

    return () => {
      resizeObserver?.disconnect();
      itemObservers.forEach((obs) => obs.disconnect());
      mason?.destroy();
      mason = null;
      resizeObserver = null;
    };
  });

  // Re-layout Masonry when cards, formWidth, or layoutState change
  $effect(() => {
    if (mason && container && container.isConnected) {
      calcAndApplyColumnWidths();
      mason.reloadItems();
      mason.layout();
    }
    cards;
    formWidth;
    layoutState;
  });
</script>

<div bind:this={container} class="sheet-character-masonry-main">
  <div class="layout-grid-sizer"></div>
  <div class="layout-gutter-sizer"></div>
  {#each cards as c (c.id)}
    <div class="sheet-component"
         class:two-span-selectable={c.span === 2}
         class:three-span-selectable={c.span === 3}>
      <div class="inner-background-container">
        <div class="fake-shadow"></div>
        <div class="inner-background">
          {#if c.comp}
            {#key c.comp}
              <c.comp {...c.props} />
            {/key}
          {:else}
            {c.txt}
          {/if}
        </div>
      </div>
    </div>
  {/each}
</div>