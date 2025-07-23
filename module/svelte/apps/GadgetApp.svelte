<script>
   import Commodity from "@sveltecomponent/Commodity.svelte";
   import Portability from "@sveltecomponent/Portability.svelte";
   import ActiveEffectsViewer from "@sveltecomponent/ActiveEffects/ActiveEffectsViewer.svelte";
   import ItemSheetComponent from "@sveltecomponent/basic/ItemSheetComponent.svelte";
   import ItemSheetWrapper from "@sveltecomponent/basic/ItemSheetWrapper.svelte";
   import Image from "@sveltecomponent/basic/Image.svelte";
   import { StoreManager } from "@sveltehelpers/StoreManager.svelte.js";
   import { onDestroy } from "svelte";
   let { item, config } = $props();
   let name = $state(item.name);

   let itemStoreManager = StoreManager.Subscribe(item);
   onDestroy(() => {
      StoreManager.Unsubscribe(item);
   });

   let isOnStore = itemStoreManager.GetRWStore("isOn");
   let isBrokenStore = itemStoreManager.GetRWStore("commodity.isBroken");

   $effect(() => {
      if ($isOnStore) {
         // foreach active effect on this object enable
      } else {
         // disable all active effects
      }
   });
</script>

<ItemSheetWrapper csslayout={"single"}>
   <ItemSheetComponent>
      <Image entity={item} />
      <div class="stat-grid single-column">
         <input type="text" value={name} onchange={(e) => item.update({ name: e.target.value })} />
      </div>
   </ItemSheetComponent>
   <Commodity {item} {config} />
   <Portability {item} {config} />
   <ItemSheetComponent>
      <ActiveEffectsViewer document={item} {config} isSlim={true} />
   </ItemSheetComponent>
</ItemSheetWrapper>
