<script>
  import Dossier from "./components/Dossier.svelte";
  import Initiative from "./components/Initiative.svelte";
  import Attributes from "./components/Attributes.svelte";
  import DicePools from "./components/DicePools.svelte";
  import Movement from "./components/Movement.svelte";
  import Skills from "./components/skills/Skills.svelte";
  import Health from "./components/Health.svelte";
  import Karma from "./components/Karma.svelte";
  import Inventory from "./components/Inventory.svelte";
  import { masonryMinWidthFallbackValue } from "../../foundry/services/commonConsts.js";

  import { setupMasonry } from "../../../module/foundry/masonry/responsiveMasonry";
  import { cardLayout } from "../../svelteStore.js";
  import { tick } from "svelte";

  let { actor, config, form } = $props();

  const defaultCardArray = [
    { comp: Dossier, props: { actor, config, id: 0, span: 1 } },
    { comp: Initiative, props: { actor, config, id: 1, span: 1 } },
    { comp: Attributes, props: { actor, config, id: 2, span: 1 } },
    { comp: DicePools, props: { actor, config, id: 3, span: 1 } },
    { comp: Movement, props: { actor, config, id: 4, span: 1 } },
    { comp: Karma, props: { actor, config, id: 5, span: 1 } },
    { comp: Skills, props: { actor, config, id: 6, span: 2 } },
    { comp: Health, props: { actor, config, id: 7, span: 1 } },
    { comp: Inventory, props: { actor, config, id: 8, span: 1 } },
  ];

  $effect(async () => {
    console.log("Actor ID " + actor.id);
    if (!actor?.id) return;

    const layout = await actor.getFlag("sr3e", "customLayout");
    const defaultLayout = defaultCardArray.map((c) => ({
      id: c.props.id,
      span: c.props.span,
    }));

    if (!Array.isArray(layout) || layout.length === 0) {
      cardLayout.set(defaultLayout);
      await actor.setFlag("sr3e", "customLayout", defaultLayout);
    } else {
      cardLayout.set(layout);
    }
  });

  let cards = $state([]);
  $effect(() => {
    cards = $cardLayout
      .map(({ id, span }) => {
        const match = defaultCardArray.find((c) => c.props.id === id);
        if (!match) return null;
        return {
          ...match,
          props: {
            ...match.props,
            span: span ?? match.props.span,
          },
        };
      })
      .filter(Boolean);
  });

  let container = null;

  // Re-trigger masonry after card updates
  $effect(async () => {
    await tick();
    container?.dispatchEvent(
      new CustomEvent("masonry-reflow", { bubbles: true }),
    );
  });

  // Save layout to flag with debounce
  let saveTimeout = null;
  $effect(() => {
    const layout = $cardLayout;
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      actor.setFlag("sr3e", "customLayout", layout);
    }, 200);
  });

  let layoutState = $state("small");
  const maxWidth = 1400;
  let masonryInstance = null;

  $effect(() => {
    if (!container) return;

    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);

    const result = setupMasonry({
      container,
      itemSelector: ".sheet-component",
      gridSizerSelector: ".layout-grid-sizer",
      gutterSizerSelector: ".layout-gutter-sizer",
      minItemWidth: masonryMinWidthFallbackValue.charaterSheet * rem,
      stateMachineThresholds: {
        small: 0,
        medium: 0.5 * maxWidth,
        wide: 0.66 * maxWidth,
      },
      onLayoutStateChange: (state) => {
        layoutState = state;
      },
    });

    masonryInstance = result.masonryInstance;

    return result.cleanup;
  });
</script>

<div
  bind:this={container}
  class="sheet-character-masonry-main"
  onmasonry-reflow={() => {
    masonryInstance.layout();
  }}
>
  <div class="layout-grid-sizer"></div>
  <div class="layout-gutter-sizer"></div>

  {#each cards as { comp: Comp, props } (props.id)}
    <div class={"sheet-component span-" + (props.span ?? 1)}>
      <div class="sr3e-inner-background-container">
        <div class="fake-shadow"></div>
        <div class="sr3e-inner-background">
          <Comp {...props} />
        </div>
      </div>
    </div>
  {/each}
</div>
