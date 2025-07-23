<script>
   import Commodity from "@sveltecomponent/Commodity.svelte";
   import Portability from "@sveltecomponent/Portability.svelte";
   import ActiveEffectsViewer from "@sveltecomponent/ActiveEffects/ActiveEffectsViewer.svelte";
   import ItemSheetComponent from "@sveltecomponent/basic/ItemSheetComponent.svelte";
   import ItemSheetWrapper from "@sveltecomponent/basic/ItemSheetWrapper.svelte";
   import StatCard from "@sveltecomponent/basic/StatCard.svelte";
   import Image from "@sveltecomponent/basic/Image.svelte";
   import { localize } from "@services/utilities.js";
   let { item, config } = $props();
   let name = $state(item.name);

   let target = $state(item.system?.gadget?.target ?? "weaponmod");

   let entries = [
      {
         item,
         key: "target",
         label: "Modification Type",
         value: target,
         path: "system.gadget",
         type: "select",
         options: Object.values(config.gadgettypes).map(localize),
      },
   ];
</script>

<ItemSheetWrapper csslayout={"single"}>
   <ItemSheetComponent>
      <Image entity={item} />
      <div class="stat-grid single-column">
         <input type="text" value={name} onchange={(e) => item.update({ name: e.target.value })} />
      </div>
      {#each entries as entry}
         <div class="stat-grid single-column">
            <StatCard {...entry} />
         </div>
      {/each}
   </ItemSheetComponent>
   <Commodity {item} {config} />
   <Portability {item} {config} />
   <ItemSheetComponent>
      <ActiveEffectsViewer document={item} {config} isSlim={true} />
   </ItemSheetComponent>
</ItemSheetWrapper>
