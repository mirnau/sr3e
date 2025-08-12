<script>
   import { localize } from "@services/utilities.js";
   import { StoreManager } from "@sveltehelpers/StoreManager.svelte";
   import { onDestroy } from "svelte";
   let { item, config, hasAmmo = $bindable(), isFirearm = $bindable() } = $props();
   let clipText = $state("Empty");

   let weaponStore = StoreManager.Subscribe(item);
   let currentClipIdStore = weaponStore.GetRWStore("ammoId");
   let currenClipObject;
   let currenClipStoreManager;
   let currentRoundsStore = null;
   let currentMaxCapacityStore = null;

   $effect(() => {
      if ($currentClipIdStore === "") return;
      currenClipObject = item.parent.items.get($currentClipIdStore);
      currenClipStoreManager = StoreManager.Subscribe(currenClipObject);
      currentRoundsStore = currenClipStoreManager.GetRWStore("rounds");
      currentMaxCapacityStore = currenClipStoreManager.GetRWStore("maxCapacity");
   });

   $effect(() => {
      if ($currentMaxCapacityStore === 0 && $currentRoundsStore === 0) {
         clipText = "Empty";
      } else if ($currentMaxCapacityStore === 0) {
         clipText = `${$currentRoundsStore}`;
      } else {
         clipText = `${$currentRoundsStore}/${$currentMaxCapacityStore}`;
      }

      if ($currentRoundsStore === 0) {
         hasAmmo = false;
      }
   });

   onDestroy(() => {
      if (currenClipObject) {
         StoreManager.Unsubscribe(currenClipObject);
         currenClipObject = null;
      }
      StoreManager.Unsubscribe(item);
   });
</script>

<h4 class="no-margin uppercase">¥ {item.system.commodity.cost} - {item.system.mode}</h4>

{#if isFirearm}
   <h4 class="no-margin uppercase">
      {localize(config.ammunition.rounds)}: {clipText}
   </h4>
{/if}
