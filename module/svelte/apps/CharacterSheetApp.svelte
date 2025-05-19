<script>
  import Dossier from "./components/Dossier.svelte";
  import Attributes from "./components/Attributes.svelte";
  import Skills from "./components/Skills.svelte";
  import Health from "./components/Health.svelte";
  import Inventory from "./components/Inventory.svelte";
  import { setupMasonry } from "../../../module/foundry/masonry/responsiveMasonry";

  let { actor, config, form } = $props();

  const cards = $state([
    { id: 0, comp: Dossier, props: { actor, config }, classes: [] },
    { id: 1, comp: Attributes, props: { actor, config }, classes: ["two-span-selectable"] },
    { id: 2, comp: Skills, props: { actor, config }, classes: ["two-span-selectable", "three-span-selectable"] },
    { id: 3, comp: Health, props: { actor, config }, classes: ["two-span-selectable"] },
    { id: 4, comp: Inventory, props: { actor, config }, classes: ["two-span-selectable", "three-span-selectable"] },
    { id: 5, txt: "Testing Databind", classes: ["debug-box"] },
    { id: 6, txt: "Testing Databind", classes: [] },
    { id: 7, txt: "Testing Databind", classes: [] },
    { id: 8, txt: "Testing Databind", classes: [] },
    { id: 9, txt: "Testing Databind", classes: [] },
  ]);

  let container = null;
  let layoutState = $state("small");

  const maxWidth = 1400;

  $effect(() => {
    if (!container) return;

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
    <div class={"sheet-component " + (c.classes?.join(" ") ?? "")}>
      <div class="sr3e-inner-background-container">
        <div class="fake-shadow"></div>
        <div class="sr3e-inner-background">
          {#if c.comp}
            {#key c.id}
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
