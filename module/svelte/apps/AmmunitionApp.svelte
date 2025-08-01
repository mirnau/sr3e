<script>
   import { localize } from "@services/utilities.js";
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
         options: Object.values(config.ammunitionClass).map(localize),
      },
      {
         item,
         key: "type",
         label: localize(config.ammunition.type),
         value: system.type,
         path: "system",
         type: "select",
         options: Object.values(config.ammunitionType).map(localize),
      },
      {
         item,
         key: "reloadMechanism",
         label: localize(config.weapon.reloadMechanism),
         value: system.reloadMechanism,
         path: "system",
         type: "select",
         options: Object.values(config.reloadMechanism).map(localize),
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

<ItemSheetWrapper csslayout={"single"}>
   <ItemSheetComponent>
      <Image entity={item} />
      <div class="stat-grid single-column">
         <input type="text" value={name} onchange={(e) => item.update({ name: e.target.value })} />
         {#each ammoEntries as entry}
            <StatCard {...entry} />
         {/each}
      </div>
   </ItemSheetComponent>

   <Commodity {item} {config} gridCss="two-column" />
   <Portability {item} {config} gridCss="two-column" />
   <JournalViewer document={item} {config} />
</ItemSheetWrapper>
