<script>
   import { localize } from "@services/utilities.js";
   import { StoreManager } from "@sveltehelpers/StoreManager.svelte";
   let { item, config } = $props();
   let clipText = $state("Empty");
   let currentRoundsStore = null;
   let currentMaxCapacityStore = null;

   let ammuntionStore = StoreManager.Subscribe(item);

   $effect(() => {
      currentRoundsStore = ammuntionStore.GetRWStore("rounds");
      currentMaxCapacityStore = ammuntionStore.GetRWStore("maxCapacity");
   });

   $effect(() => {
      if ($currentMaxCapacityStore === 0 && $currentRoundsStore === 0) {
         clipText = "Empty";
      } else if ($currentMaxCapacityStore === 0) {
         clipText = `${$currentRoundsStore}`;
      } else {
         clipText = `${$currentRoundsStore}/${$currentMaxCapacityStore}`;
      }
   });
</script>

<h4 class="no-margin uppercase">¥ {item.system.commodity.cost} - {item.system.type}</h4>
<h4 class="no-margin uppercase">
   {localize(config.ammunition.rounds)}: {clipText}
</h4>
