<script lang="ts">
  import { localize } from "@services/utilities.js";
  import StatCard from "@sveltecomponent/basic/StatCard.svelte";
  import MasonryGrid from "@sveltecomponent/basic/MasonryGrid.svelte";
  import CardToolbar from "@sveltecomponent/CardToolbar.svelte";

  let { actor, config, id, span } = $props();
  const system = $state(actor.system);

  const isDrone = $derived(system.category === "drone");
  const showAutonav = $derived(!isDrone);
  const showPilot = $derived(isDrone);

  const coreStatsCommon = $derived([
    { item: actor, key: "handling", label: localize(config.mechanical.handling), value: system.handling, path: "system", type: "number" },
    { item: actor, key: "speed", label: localize(config.mechanical.speed), value: system.speed, path: "system", type: "number" },
    { item: actor, key: "accel", label: localize(config.mechanical.accel), value: system.accel, path: "system", type: "number" },
    { item: actor, key: "body", label: localize(config.mechanical.body), value: system.body, path: "system", type: "number" },
    { item: actor, key: "armor", label: localize(config.mechanical.armor), value: system.armor, path: "system", type: "number" },
    { item: actor, key: "signature", label: localize(config.mechanical.signature), value: system.signature, path: "system", type: "number" },
    { item: actor, key: "sensor", label: localize(config.mechanical.sensor), value: system.sensor, path: "system", type: "number" },
    { item: actor, key: "speedTurbo", label: localize(config.mechanical.speedTurbo), value: system.speedTurbo, path: "system", type: "number" },
    { item: actor, key: "accelTurbo", label: localize(config.mechanical.accelTurbo), value: system.accelTurbo, path: "system", type: "number" },
  ]);

  const coreStatsAutonav = $derived([
    { item: actor, key: "autonav", label: localize(config.mechanical.autonav), value: system.autonav, path: "system", type: "number" },
  ]);

  const coreStatsPilot = $derived([
    { item: actor, key: "pilot", label: localize(config.mechanical.pilot), value: system.pilot, path: "system", type: "number" },
  ]);
</script>

<CardToolbar {id} />
<h3>{localize(config.mechanical.performance)}</h3>
<MasonryGrid itemSelector="stat-card" gridPrefix="attribute">
  {#each coreStatsCommon as entry}
    <StatCard {...entry} />
  {/each}
  {#if showAutonav}
    {#each coreStatsAutonav as entry}
      <StatCard {...entry} />
    {/each}
  {/if}
  {#if showPilot}
    {#each coreStatsPilot as entry}
      <StatCard {...entry} />
    {/each}
  {/if}
</MasonryGrid>
