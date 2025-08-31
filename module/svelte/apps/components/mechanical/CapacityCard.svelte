<script>
  import { localize } from "@services/utilities.js";
  import StatCard from "@sveltecomponent/basic/StatCard.svelte";
  import MasonryGrid from "@sveltecomponent/basic/MasonryGrid.svelte";
  import CardToolbar from "@sveltecomponent/CardToolbar.svelte";

  let { actor, config, id, span } = $props();
  const system = $state(actor.system);

  const capacityStats = $derived([
    { item: actor, key: "cargo", label: localize(config.mechanical.cargo), value: system.cargo, path: "system", type: "number" },
    { item: actor, key: "load", label: localize(config.mechanical.load), value: system.load, path: "system", type: "number" },
  ]);
</script>

<CardToolbar {id} />
<h3>{localize(config.mechanical.capacity)}</h3>
<MasonryGrid itemSelector="stat-card" gridPrefix="attribute">
  {#each capacityStats as entry}
    <StatCard {...entry} />
  {/each}
</MasonryGrid>
