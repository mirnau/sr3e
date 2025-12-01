<script lang="ts">
  import { localize, kvOptions } from "@services/utilities.js";
  import StatCard from "@sveltecomponent/basic/StatCard.svelte";
  import MasonryGrid from "@sveltecomponent/basic/MasonryGrid.svelte";
  import CardToolbar from "@sveltecomponent/CardToolbar.svelte";

  let { actor, config, id, span } = $props();
  const system = $state(actor.system);

  const categoryOptions = kvOptions(config.mechanicalCategories);
  const powerOptions = kvOptions(config.powerSources);
  const landingOptions = kvOptions(config.landingTakeoff);

  const airCats = new Set(["fixedWing", "rotor", "vectoredThrust", "lta", "tBird"]);
  const isDrone = $derived(system.category === "drone");
  const isAir = $derived(airCats.has(system.category));
  const showLanding = $derived(isAir || isDrone);

  const classificationEntries = $derived([
    { item: actor, key: "category", label: localize(config.mechanical.category), value: system.category, path: "system", type: "select", options: categoryOptions },
    { item: actor, key: "power", label: localize(config.mechanical.power), value: system.power, path: "system", type: "select", options: powerOptions },
    { item: actor, key: "riggerAdaptation", label: localize(config.mechanical.riggerAdaptation), value: system.riggerAdaptation, path: "system", type: "checkbox" },
    { item: actor, key: "remoteControlInterface", label: localize(config.mechanical.remoteControlInterface), value: system.remoteControlInterface, path: "system", type: "checkbox" },
    { item: actor, key: "seating", label: localize(config.mechanical.seating), value: system.seating, path: "system", type: "text" },
    { item: actor, key: "entryPoints", label: localize(config.mechanical.entryPoints), value: system.entryPoints, path: "system", type: "text" },
  ]);

  const landingEntry = $derived({
    item: actor,
    key: "landingTakeoff",
    label: localize(config.mechanical.landingTakeoff),
    value: system.landingTakeoff,
    path: "system",
    type: "select",
    options: landingOptions,
  });

  const mediumLabel = $derived(
    isDrone ? localize(config.mechanical.medium.drone)
    : isAir ? localize(config.mechanical.medium.air)
    : localize(config.common.unknown)
  );
</script>

<CardToolbar {id} />
<h3>{localize(config.common.details)}</h3>
<MasonryGrid itemSelector="stat-card" gridPrefix="attribute">
  {#each classificationEntries as entry}
    <StatCard {...entry} />
  {/each}
  {#if showLanding}
    <StatCard {...landingEntry} />
  {/if}
</MasonryGrid>

<div class="medium-chip">{mediumLabel}</div>

 
