<script>
  import MasonryGrid from "@sveltecomponent/basic/MasonryGrid.svelte";
  import { cardLayout } from "../../svelteStore.js";
  import HeaderCard from "@sveltecomponent/mechanical/HeaderCard.svelte";
  import DetailsCard from "@sveltecomponent/mechanical/DetailsCard.svelte";
  import PerformanceCard from "@sveltecomponent/mechanical/PerformanceCard.svelte";
  import CapacityCard from "@sveltecomponent/mechanical/CapacityCard.svelte";
  import DroneOpsCard from "@sveltecomponent/mechanical/DroneOpsCard.svelte";
  import MountsCard from "@sveltecomponent/mechanical/MountsCard.svelte";
  import CommodityCard from "@sveltecomponent/mechanical/CommodityCard.svelte";

  let { actor, config, form } = $props();
  const system = $state(actor.system);

  const isDrone = $derived(system.category === "drone");

  const defaultCardArray = [
    { comp: HeaderCard, props: { actor, config, id: 0, span: 2 } },
    { comp: DetailsCard, props: { actor, config, id: 1, span: 1 } },
    { comp: PerformanceCard, props: { actor, config, id: 2, span: 2 } },
    { comp: CapacityCard, props: { actor, config, id: 3, span: 1 } },
    { comp: DroneOpsCard, props: { actor, config, id: 4, span: 1 } },
    { comp: MountsCard, props: { actor, config, id: 5, span: 2 } },
    { comp: CommodityCard, props: { actor, config, id: 6, span: 2 } },
  ];

  // Initialize or restore layout per-actor
  $effect(async () => {
    if (!actor?.id) return;
    const layout = await actor.getFlag("sr3e", "customLayout");
    const defaultLayout = defaultCardArray.map((c) => ({ id: c.props.id, span: c.props.span }));
    if (!Array.isArray(layout) || layout.length === 0) {
      cardLayout.set(defaultLayout);
      await actor.setFlag("sr3e", "customLayout", defaultLayout);
    } else {
      cardLayout.set(layout);
    }
  });

  let cards = $state([]);
  $effect(() => {
    const isDroneLocal = system.category === "drone";
    cards = $cardLayout
      .map(({ id, span }) => {
        const match = defaultCardArray.find((c) => c.props.id === id);
        if (!match) return null;
        // Conditionally hide DroneOps card for non-drones
        if (id === 4 && !isDroneLocal) return null;
        // Enforce header (id 0) to always span 2 and have no toolbar
        const enforcedSpan = id === 0 ? 2 : (span ?? match.props.span);
        return { ...match, props: { ...match.props, span: enforcedSpan } };
      })
      .filter(Boolean);
  });

  // Persist layout (debounced)
  let saveTimeout = null;
  $effect(() => {
    // Enforce header span to 2 before persisting
    const layout = $cardLayout.map((c) => (c.id === 0 ? { ...c, span: 2 } : c));
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      actor.setFlag("sr3e", "customLayout", layout);
    }, 200);
  });
</script>

<MasonryGrid itemSelector="sheet-component" gridPrefix="sheet">
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
  {#if cards.length === 0}
    <div class="sheet-component span-1">
      <div class="sr3e-inner-background-container">
        <div class="fake-shadow"></div>
        <div class="sr3e-inner-background">
          <p>No cards to display.</p>
        </div>
      </div>
    </div>
  {/if}
  
</MasonryGrid>
