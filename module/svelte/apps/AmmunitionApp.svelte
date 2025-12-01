<script lang="ts">
   import { localize, kvOptions } from "@services/utilities.js";
   import StatCard from "@sveltecomponent/basic/StatCard.svelte";
   import Commodity from "@sveltecomponent/Commodity.svelte";
   import Portability from "@sveltecomponent/Portability.svelte";
   import JournalViewer from "@sveltecomponent/JournalViewer.svelte";
   import Image from "@sveltecomponent/basic/Image.svelte";
   import ItemSheetComponent from "@sveltecomponent/basic/ItemSheetComponent.svelte";
   import ItemSheetWrapper from "@sveltecomponent/basic/ItemSheetWrapper.svelte";

   let { item = {}, config = {} } = $props();

   const system = $state(item.system);
   let name = $state(item.name);

   const ammoEntries = $derived([
      {
         item,
         key: "class",
         label: localize(config.ammunition.class),
         value: system.class,
         path: "system",
         type: "select",
         options: kvOptions(config.ammunitionClass),
      },
      {
         item,
         key: "type",
         label: localize(config.ammunition.type),
         value: system.type,
         path: "system",
         type: "select",
         options: kvOptions(config.ammunitionType),
      },
      {
         item,
         key: "reloadMechanism",
         label: localize(config.weapon.reloadMechanism),
         value: system.reloadMechanism,
         path: "system",
         type: "select",
         options: kvOptions(config.reloadMechanism),
      }
   ]);
   const capacityEntries = $derived([
      {
         item,
         key: "rounds",
         label: localize(config.ammunition.rounds),
         value: system.rounds,
         path: "system",
         type: "number",
      },
      {
         item,
         key: "maxCapacity",
         label: localize(config.ammunition.maxcapacity),
         value: system.maxCapacity,
         path: "system",
         type: "number",
      },
   ]);
</script>

<ItemSheetWrapper csslayout={"double"}>
   <ItemSheetComponent>
      <Image entity={item} />
      <div class="stat-grid single-column">
         <input type="text" value={name} onchange={(e) => item.update({ name: (e.target as HTMLInputElement)?.value })} />
      </div>
      <div class="stat-grid single-column">
         {#each ammoEntries as entry}
            <StatCard {...entry} />
         {/each}
      </div>
      <div class="stat-grid two-column">
         {#each capacityEntries as entry}
            <StatCard {...entry} />
         {/each}
      </div>
   </ItemSheetComponent>

   <Commodity {item} {config} gridCss="two-column" />
   <Portability {item} {config} gridCss="two-column" />
   <JournalViewer document={item} {config} />
</ItemSheetWrapper>
