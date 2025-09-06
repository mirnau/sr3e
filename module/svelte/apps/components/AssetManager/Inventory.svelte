<script>
   import { setupMasonry } from "@masonry/responsiveMasonry.js";
   import { masonryMinWidthFallbackValue } from "@services/commonConsts.js";
   import ActorDataService from "@services/ActorDataService.js";
   import { flags, inventory } from "@services/commonConsts.js";
   import { StoreManager } from "@sveltehelpers/Storemanager.svelte.js";
   import { onDestroy } from "svelte";
   import { localize } from "@services/utilities.js";
   import FilterToggle from "@sveltecomponent/AssetManager/FilterToggle.svelte";
   import InventoryCard from "@sveltecomponent/AssetManager/InventoryCard.svelte";

   let { actor, config } = $props();

   let gridContainer;
   let activeTab = $state(inventory.inventory);
   let allItems = $state([]);
   let filteredItems = $state([]);

   const actorStoreManager = StoreManager.Subscribe(actor);
   onDestroy(() => StoreManager.Unsubscribe(actor));

   const isFavoriteStore = actorStoreManager.GetFlagStore("isFavorite");
   const isEquippedStore = actorStoreManager.GetFlagStore("isEquipped");
   const isAmmunitionStore = actorStoreManager.GetFlagStore("isAmmunition");
   const isWeaponStore = actorStoreManager.GetFlagStore("isWeapon");
   const isWornStore = actorStoreManager.GetFlagStore("isWorn");
   const isGadgetStore = actorStoreManager.GetFlagStore("isGadget");
   const isTechStore = actorStoreManager.GetFlagStore("isTech");

   let isFavorite = $state($isFavoriteStore);
   let isEquipped = $state($isEquippedStore);
   let isAmmunition = $state($isAmmunitionStore);
   let isWeapon = $state($isWeaponStore);
   let isWorn = $state($isWornStore);
   let isGadget = $state($isGadgetStore);
   let isTech = $state($isTechStore);

   $effect(() => {
      isFavorite = $isFavoriteStore;
      isEquipped = $isEquippedStore;
      isAmmunition = $isAmmunitionStore;
      isWeapon = $isWeaponStore;
      isWorn = $isWornStore;
      isGadget = $isGadgetStore;
      isTech = $isTechStore;
   });

   $effect(() => {
      isFavoriteStore.set(isFavorite);
      isEquippedStore.set(isEquipped);
      isAmmunitionStore.set(isAmmunition);
      isWeaponStore.set(isWeapon);
      isWornStore.set(isWorn);
      isGadgetStore.set(isGadget);
      isTechStore.set(isTech);
   });

   $effect(() => {
      const _ = actor.items.contents;
      allItems = ActorDataService.getInventory(actor, ["ammunition", "weapon", "wearable", "gadget", "techinterface"]);
   });

   $effect(() => {
      filteredItems = allItems.filter((entry) => {
         const item = entry.item || entry;

         const typeMatches =
            (isAmmunition && item.type === "ammunition") ||
            (isWeapon && item.type === "weapon") ||
            (isWorn && item.type === "wearable") ||
            (isGadget && item.type === "gadget") ||
            (isTech && item.type === "techinterface");

         const hasTypeFilter = isAmmunition || isWeapon || isWorn || isGadget || isTech;
         const passesTypeFilter = hasTypeFilter ? typeMatches : true;

         const itemFlags = item.flags?.sr3e || {};
         const passesFavoriteFilter = isFavorite ? itemFlags.isFavorite : true;
         const passesEquippedFilter = isEquipped ? itemFlags.isEquipped : true;

         return passesTypeFilter && passesFavoriteFilter && passesEquippedFilter;
      });
   });

   $effect(() => {
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const masonryConfig = {
         container: gridContainer,
         itemSelector: ".asset-card-container",
         gridSizerSelector: ".asset-grid-sizer",
         gutterSizerSelector: ".asset-gutter-sizer",
         minItemWidth: masonryMinWidthFallbackValue.assetGrid * rem,
      };

      const masonry = setupMasonry(masonryConfig);
      return masonry.cleanup;
   });
</script>

<div class="asset-category-container static-full-width">
   <div class="asset-masonry-background-layer"></div>
   <FilterToggle
      bind:checked={isFavorite}
      label={localize(config.inventory.favourites)}
      svgName="star-svgrepo-com.svg"
   />
   <FilterToggle
      bind:checked={isEquipped}
      label={localize(config.inventory.equipped)}
      svgName="backpack-svgrepo-com.svg"
   />
   <FilterToggle
      bind:checked={isAmmunition}
      label={localize(config.ammunition.ammunition)}
      svgName="bullets-svgrepo-com.svg"
   />
   <FilterToggle bind:checked={isWeapon} label={localize(config.weapon.weapon)} svgName="rifle-gun-svgrepo-com.svg" />
   <FilterToggle
      bind:checked={isWorn}
      label={localize(config.wearable.apparel ?? config.wearable.wearable)}
      svgName="coat-with-pockets-svgrepo-com.svg"
   />
   <FilterToggle bind:checked={isGadget} label={localize(config.gadget.gadget)} svgName="cogs-f-svgrepo-com.svg" />
   <FilterToggle
      bind:checked={isTech}
      label={localize(config.techinterface.techinterface)}
      svgName="router-svgrepo-com.svg"
   />
</div>

<div class="asset-category-container static-full-width">
   <div class="asset-masonry-background-layer"></div>
   <div class="asset-container-header">
      {localize(config.inventory.title)}
   </div>
   <div bind:this={gridContainer} class="asset-masonry-grid">
      <div class="asset-grid-sizer"></div>
      <div class="asset-gutter-sizer"></div>

      {#each filteredItems as item (item.id)}
         <div class="asset-card-container">
            <InventoryCard {item} {config} />
         </div>
      {/each}
   </div>
</div>
