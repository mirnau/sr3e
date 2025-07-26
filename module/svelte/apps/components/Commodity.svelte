<script>
   import { localize } from "@services/utilities.js";
   import StatCard from "@sveltecomponent/basic/StatCard.svelte";
   import ItemSheetComponent from "@sveltecomponent/basic/ItemSheetComponent.svelte";
   let { item, config, gridCss = "" } = $props();
   const system = $state(item.system);
   const commodity = system.commodity;
   const legality = commodity.legality;

   const entries = [
      {
         item,
         key: "days",
         label: localize(config.commodity.days),
         value: commodity.days,
         path: "system.commodity",
         type: "number",
      },
      {
         item,
         key: "cost",
         label: localize(config.commodity.cost),
         value: commodity.cost,
         path: "system.commodity",
         type: "number",
      },
      {
         item,
         key: "streetIndex",
         label: localize(config.commodity.streetIndex),
         value: commodity.streetIndex,
         path: "system.commodity",
         type: "number",
      },
      {
         item,
         key: "isBroken",
         label: localize(config.commodity.isBroken),
         value: commodity.isBroken,
         path: "system.commodity",
         type: "checkbox",
      },
   ];

   const singleColumnEntries = [
      {
         item,
         key: "status",
         label: localize(config.commodity.legalstatus),
         value: legality.status,
         path: "system.commodity.legality",
         type: "select",
         options: Object.values(config.legalstatus).map(localize),
      },
      {
         item,
         key: "permit",
         label: localize(config.commodity.legalpermit),
         value: legality.permit,
         path: "system.commodity.legality",
         type: "select",
         options: Object.values(config.legalpermit).map(localize),
      },
      {
         item,
         key: "priority",
         label: localize(config.commodity.legalenforcementpriority),
         value: legality.priority,
         path: "system.commodity.legality",
         type: "select",
         options: Object.values(config.legalpriority).map(localize),
      },
   ];
</script>

<ItemSheetComponent>
   <h3>{localize(config.commodity.commodity)}</h3>
   <div class="stat-grid {gridCss}">
      {#each entries as entry}
         <StatCard {...entry} />
      {/each}
   </div>
   <div class="stat-grid single-column">
      {#each singleColumnEntries as entry}
         <StatCard {...entry} />
      {/each}
   </div>
</ItemSheetComponent>
