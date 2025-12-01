<script lang="ts">
   import { localize } from "@services/utilities.js";
   import StatCard from "@sveltecomponent/basic/StatCard.svelte";
   import Commodity from "@sveltecomponent/Commodity.svelte";
   import Portability from "@sveltecomponent/Portability.svelte";
   import JournalViewer from "@sveltecomponent/JournalViewer.svelte";
   import Image from "@sveltecomponent/basic/Image.svelte";
   import ItemSheetComponent from "@sveltecomponent/basic/ItemSheetComponent.svelte";
   import ItemSheetWrapper from "@sveltecomponent/basic/ItemSheetWrapper.svelte";
   import ActiveEffectsViewer from "@sveltecomponent/ActiveEffects/ActiveEffectsViewer.svelte";
   import GadgetViewer from "@sveltecomponent/GadgetViewer.svelte";

   let { item = {}, config = {} } = $props();

   const system = $state(item.system);
   let name = $state(item.name);

   const armorEntries = $derived([
      {
         item,
         key: "ballistic",
         label: localize(config.wearable.ballistic),
         value: system.ballistic,
         path: "system",
         type: "number",
      },
      {
         item,
         key: "impact",
         label: localize(config.wearable.impact),
         value: system.impact,
         path: "system",
         type: "number",
      },
      {
         item,
         key: "canLayer",
         label: localize(config.wearable.canlayer),
         value: system.canLayer,
         path: "system",
         type: "checkbox",
      },
   ]);
</script>

<ItemSheetWrapper csslayout={"double"}>
   <ItemSheetComponent>
      <Image entity={item} />
      <div class="stat-grid single-column">
         <input type="text" value={name} onchange={(e) => item.update({ name: e.target.value })} />
      </div>
      <div class="stat-grid two-column">
         {#each armorEntries as entry}
            <StatCard {...entry} />
         {/each}
      </div>
   </ItemSheetComponent>

   <ItemSheetComponent>
      <div>
         <h3>{localize(config.gadget.gadget)}</h3>
      </div>
      <GadgetViewer document={item} {config} isSlim={true} />
   </ItemSheetComponent>

   <ItemSheetComponent>
      <ActiveEffectsViewer document={item} {config} isSlim={true} />
   </ItemSheetComponent>

   <Commodity {item} {config} gridCss="two-column" />
   <Portability {item} {config} gridCss="two-column" />

   <JournalViewer document={item} {config} />
</ItemSheetWrapper>
