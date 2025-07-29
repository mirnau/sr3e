<script>
   import { setupMasonry } from "@masonry/responsiveMasonry.js";
   import { masonryMinWidthFallbackValue } from "@services/commonConsts.js";
   import ActorDataService from "@services/ActorDataService.js";
   import { flags, inventory } from "@services/commonConsts.js";
   import { StoreManager } from "@sveltehelpers/Storemanager.svelte.js";
   import { onDestroy } from "svelte";
   import { localize } from "@services/utilities.js";
   import FilterToggle from "@sveltecomponent/AssetManager/FilterToggle.svelte";
   let { actor, config } = $props();
   let gridContainer;
   let activeTab = $state(inventory.inventory);

   let actorStoreManager = StoreManager.Subscribe(actor);
   onDestroy(() => {
      StoreManager.Unsubscribe(actor);
   });

   let isFavoriteStore = actorStoreManager.GetFlagStore("isFavorite");
   let isEquippedStore = actorStoreManager.GetFlagStore("isEquipped");
   let isAmmunitionStore = actorStoreManager.GetFlagStore("isAmmunition");
   let isWeaponStore = actorStoreManager.GetFlagStore("isWeapon");
   let isWornStore = actorStoreManager.GetFlagStore("isWorn");
   let isGadgetStore = actorStoreManager.GetFlagStore("isEquipped");

   const types = ["ammunition", "weapon", "wearable", "gadget"];
   ActorDataService.getInventory(actor, types);
   

   $effect(() => {
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);

      const result = setupMasonry({
         container: gridContainer,
         itemSelector: ".skill-card-container",
         gridSizerSelector: ".skill-grid-sizer",
         gutterSizerSelector: ".skill-gutter-sizer",
         minItemWidth: masonryMinWidthFallbackValue.skillGrid * rem,
      });

      return result.cleanup;
   });
</script>

<div class="sr3e-inner-background">
   <FilterToggle
      checked={$isFavoriteStore}
      label={localize(config.inventory.favourites)}
      svgName={"star-svgrepo-com.svg"}
   />
   <FilterToggle
      checked={$isEquippedStore}
      label={localize(config.inventory.equipped)}
      svgName={"backpack-svgrepo-com.svg"}
   />
   <FilterToggle
      checked={$isAmmunitionStore}
      label={localize(config.ammunition.ammunition)}
      svgName={"bullets-svgrepo-com.svg"}
   />
   <FilterToggle
      checked={$isWeaponStore}
      label={localize(config.weapon.weapon)}
      svgName={"rifle-gun-svgrepo-com.svg"}
   />
   <FilterToggle
      checked={$isWornStore}
      label={localize(config.wearable.wearables)}
      svgName={"coat-with-pockets-svgrepo-com.svg"}
   />
   <FilterToggle
      checked={$isGadgetStore}
      label={localize(config.inventory.equipped)}
      svgName={"bullets-svgrepo-com.svg"}
   />
</div>
<div class="sr3e-inner-background">
   <div class="skill-category-container static-full-width">
      <div class="skill-masonry-background-layer"></div>
      <div class="skill-container-header">doodle do</div>
      <div bind:this={gridContainer} class="skill-masonry-grid">
         <div class="skill-grid-sizer"></div>
         <div class="skill-gutter-sizer"></div>
      </div>
   </div>
</div>
