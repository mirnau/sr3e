<script>
  import { localize } from "@services/utilities.js";
  import StatCard from "@sveltecomponent/basic/StatCard.svelte";
  import MasonryGrid from "@sveltecomponent/basic/MasonryGrid.svelte";
  import CardToolbar from "@sveltecomponent/CardToolbar.svelte";

  let { actor, config, id, span } = $props();
  const system = $state(actor.system);

  const entries = $derived([
    { item: actor, key: "setupBreakdownMinutes", label: localize(config.mechanical.setupBreakdownMinutes), value: system.setupBreakdownMinutes, path: "system", type: "number" },
  ]);
</script>

<CardToolbar {id} />
<h3>{localize(config.mechanical.droneOps)}</h3>
<MasonryGrid itemSelector="stat-card" gridPrefix="attribute">
  {#each entries as entry}
    <StatCard {...entry} />
  {/each}
</MasonryGrid>
