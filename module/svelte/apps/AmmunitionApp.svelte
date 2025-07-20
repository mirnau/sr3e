<script>
   import { localize, openFilePicker } from "../../services/utilities.js";
   import StatCard from "./components/StatCard.svelte";
   import Commodity from "./components/Commodity.svelte";
   import Portability from "./components/Portability.svelte";
   import JournalViewer from "./components/JournalViewer.svelte";
   import Image from "./components/basic/Image.svelte";
   import ItemSheetComponent from "./components/basic/ItemSheetComponent.svelte";

   let { item = {}, config = {} } = $props();

   const system = $state(item.system);
   let layoutMode = $state("single");
   let name = $state(item.name);

   const ammunitionTypeOptions = Object.values(config.ammunitionType).map(localize);
   const ammunitionClassOptions = Object.values(config.ammunitionClass).map(localize);

   const ammoEntries = $derived([
      {
         item,
         key: "class",
         label: localize(config.ammunition.class),
         value: system.class,
         path: "system",
         type: "select",
         options: ammunitionClassOptions,
      },
      {
         item,
         key: "type",
         label: localize(config.ammunition.type),
         value: system.type,
         path: "system",
         type: "select",
         options: ammunitionTypeOptions,
      },
      {
         item,
         key: "rounds",
         label: localize(config.ammunition.rounds),
         value: system.rounds,
         path: "system",
         type: "number",
         options: [],
      },
   ]);
</script>

<div class="sr3e-waterfall-wrapper">
   <div class={`sr3e-waterfall sr3e-waterfall--${layoutMode}`}>
      <ItemSheetComponent>
         <Image entity={item} />
         <div class="stat-grid single-column">
            <input type="text" bind:value={name} onchange={(e) => item.update({ name: e.target.value })} />
            {#each ammoEntries as entry}
               <StatCard {...entry} />
            {/each}
         </div>
      </ItemSheetComponent>

      <Commodity {item} {config} gridCss="two-column" />
      <Portability {item} {config} gridCss="two-column" />
      <JournalViewer document={item} {config} />
   </div>
</div>
