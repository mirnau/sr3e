<script>
   import Commodity from "@sveltecomponent/basic/StatCard.svelte";
   import { localize } from "@services/utilities.js";
   import ActiveEffectsViewer from "@sveltecomponent/ActiveEffects/ActiveEffectsViewer.svelte";
   import StatCard from "@sveltecomponent/basic/StatCard.svelte";
   import ItemSheetComponent from "@sveltecomponent/basic/ItemSheetComponent.svelte";
   import ItemSheetWrapper from "@sveltecomponent/basic/ItemSheetWrapper.svelte";
   import Image from "@sveltecomponent/basic/Image.svelte";
   let { item, config } = $props();
   let name = $state(item.name);

   const entries = $derived([
      {
         item,
         key: "class",
         label: localize(config.gadget.type),
         value: item.system.type,
         path: "system",
         type: "select",
         options: Object.values(config.gadgettypes).map(localize),
      },
   ]);
</script>

<ItemSheetWrapper csslayout={"single"}>
   <ItemSheetComponent>
      <Image entity={item} />
      <div class="stat-grid single-column">
         <input type="text" value={name} onchange={(e) => item.update({ name: e.target.value })} />
         {#each entries as entry}
            <StatCard {...entry} />
         {/each}
      </div>
   </ItemSheetComponent>
   <Commodity {item} {config} gridCss="two-column" />
   <ItemSheetComponent>
      <ActiveEffectsViewer document={item} {config} isSlim={true} />
   </ItemSheetComponent>
</ItemSheetWrapper>
