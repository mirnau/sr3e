<script lang="ts">
  import { localize } from "@services/utilities.js";
  import StatCard from "@sveltecomponent/basic/StatCard.svelte";
  import MasonryGrid from "@sveltecomponent/basic/MasonryGrid.svelte";
  import CardToolbar from "@sveltecomponent/CardToolbar.svelte";

  let { actor, config, id, span } = $props();
  const system = $state(actor.system);

  const mounts = $derived([
    { item: actor, key: "mounts.firmpoints", label: localize(config.mechanical.mounts.firmpoints), value: system.mounts?.firmpoints ?? 0, path: "system", type: "number" },
    { item: actor, key: "mounts.hardpoints", label: localize(config.mechanical.mounts.hardpoints), value: system.mounts?.hardpoints ?? 0, path: "system", type: "number" },
    { item: actor, key: "mounts.turrets", label: localize(config.mechanical.mounts.turrets), value: system.mounts?.turrets ?? 0, path: "system", type: "number" },
    { item: actor, key: "mounts.externalFixed", label: localize(config.mechanical.mounts.externalFixed), value: system.mounts?.externalFixed ?? 0, path: "system", type: "number" },
    { item: actor, key: "mounts.internalFixed", label: localize(config.mechanical.mounts.internalFixed), value: system.mounts?.internalFixed ?? 0, path: "system", type: "number" },
    { item: actor, key: "mounts.pintles", label: localize(config.mechanical.mounts.pintles), value: system.mounts?.pintles ?? 0, path: "system", type: "number" },
    { item: actor, key: "mounts.miniTurrets", label: localize(config.mechanical.mounts.miniTurrets), value: system.mounts?.miniTurrets ?? 0, path: "system", type: "number" },
  ]);
</script>

<CardToolbar {id} />
<h3>{localize(config.mechanical.mounts.title)}</h3>
<MasonryGrid itemSelector="stat-card" gridPrefix="attribute">
  {#each mounts as entry}
    <StatCard {...entry} />
  {/each}
</MasonryGrid>
