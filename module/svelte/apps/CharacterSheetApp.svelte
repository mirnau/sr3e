<script>
  import Dossier from "./components/Dossier.svelte";
  import Attributes from "./components/Attributes.svelte";
  import Skills from "./components/Skills.svelte";
  import Health from "./components/Health.svelte";
  import Inventory from "./components/Inventory.svelte";
  import { setupMasonry } from "../../../module/foundry/masonry/responsiveMasonry";

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
  let layoutState = $state("small");

  const maxWidth = 1400;

  $effect(() => {
    const cleanup = setupMasonry({
      container,
      itemSelector: ".sheet-component",
      gridSizerSelector: ".layout-grid-sizer",
      gutterSizerSelector: ".layout-gutter-sizer",
      minItemWidth: 220,
      stateMachineThresholds: {
        small: 0,
        medium: 0.5 * maxWidth,
        wide: 0.66 * maxWidth,
      },
      onLayoutStateChange: (state) => {
        layoutState = state;
      },
    });

    return cleanup;
  });
</script>

<div bind:this={container} class="sheet-character-masonry-main">
  <div class="layout-grid-sizer"></div>
  <div class="layout-gutter-sizer"></div>
  {#each cards as c (c.id)}
    <div
      class="sheet-component"
      class:two-span-selectable={c.span === 2}
      class:three-span-selectable={c.span === 3}
    >
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
