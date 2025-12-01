<script lang="ts">
   import { localize, kvOptions } from "@services/utilities.js";
   import StatCard from "@sveltecomponent/basic/StatCard.svelte";
   import MasonryGrid from "@sveltecomponent/basic/MasonryGrid.svelte";
   import CardToolbar from "@sveltecomponent/CardToolbar.svelte";

   let { actor, config, id, span } = $props();
   const system = $state(actor.system);
   const commodity = system.commodity;
   const legality = commodity.legality;

   const entries = [
      {
         item: actor,
         key: "days",
         label: localize(config.commodity.days),
         value: commodity.days,
         path: "system.commodity",
         type: "number",
      },
      {
         item: actor,
         key: "cost",
         label: localize(config.commodity.cost),
         value: commodity.cost,
         path: "system.commodity",
         type: "number",
      },
      {
         item: actor,
         key: "streetIndex",
         label: localize(config.commodity.streetIndex),
         value: commodity.streetIndex,
         path: "system.commodity",
         type: "number",
      },
      {
         item: actor,
         key: "isBroken",
         label: localize(config.commodity.isBroken),
         value: commodity.isBroken,
         path: "system.commodity",
         type: "checkbox",
      },
   ];

   const legalEntries = [
      {
         item: actor,
         key: "status",
         label: localize(config.commodity.legalstatus),
         value: legality.status,
         path: "system.commodity.legality",
         type: "select",
         options: kvOptions(config.legalstatus),
      },
      {
         item: actor,
         key: "permit",
         label: localize(config.commodity.legalpermit),
         value: legality.permit,
         path: "system.commodity.legality",
         type: "select",
         options: kvOptions(config.legalpermit),
      },
      {
         item: actor,
         key: "priority",
         label: localize(config.commodity.legalenforcementpriority),
         value: legality.priority,
         path: "system.commodity.legality",
         type: "select",
         options: kvOptions(config.legalpriority),
      },
   ];
</script>

<CardToolbar {id} />
<h3>{localize(config.commodity.commodity)}</h3>
<MasonryGrid itemSelector="stat-card" gridPrefix="attribute">
   {#each entries as entry}
      <StatCard {...entry} />
   {/each}
</MasonryGrid>

<MasonryGrid itemSelector="stat-card" gridPrefix="attribute">
   {#each legalEntries as entry}
      <StatCard {...entry} />
   {/each}
</MasonryGrid>
