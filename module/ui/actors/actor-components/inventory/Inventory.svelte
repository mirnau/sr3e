<script lang="ts">
   import { setupPackery } from "../../../../ui/Packery/setupPackery";
   import { StoreManager } from "../../../../utilities/StoreManager.svelte";
   import { onDestroy, untrack } from "svelte";
   import { localize } from "../../../../services/utilities";
   import FilterToggle from "./FilterToggle.svelte";
   import InventoryCard from "./InventoryCard.svelte";

   const p = $props<{ actor: Actor }>();
   const actor = untrack(() => p.actor);

   let gridContainer: HTMLElement;
   let allItems = $state<any[]>([]);
   let filteredItems = $state<any[]>([]);

   const storeManager = StoreManager.Instance;
   storeManager.Subscribe(actor);
   onDestroy(() => {
      Hooks.off("createItem", createHookId);
      Hooks.off("updateItem", updateHookId);
      Hooks.off("deleteItem", deleteHookId);
      storeManager.Unsubscribe(actor);
   });

   const isFavoriteStore   = storeManager.GetFlagStore<boolean>(actor, "isFavorite",   false);
   const isEquippedStore   = storeManager.GetFlagStore<boolean>(actor, "isEquipped",   false);
   const isAmmunitionStore = storeManager.GetFlagStore<boolean>(actor, "isAmmunition", false);
   const isWeaponStore     = storeManager.GetFlagStore<boolean>(actor, "isWeapon",     false);
   const isWornStore       = storeManager.GetFlagStore<boolean>(actor, "isWorn",       false);
   const isGadgetStore     = storeManager.GetFlagStore<boolean>(actor, "isGadget",     false);
   const isTechStore       = storeManager.GetFlagStore<boolean>(actor, "isTech",       false);
   const isMagicStore      = storeManager.GetFlagStore<boolean>(actor, "isMagic",      false);

   let isFavorite   = $state($isFavoriteStore);
   let isEquipped   = $state($isEquippedStore);
   let isAmmunition = $state($isAmmunitionStore);
   let isWeapon     = $state($isWeaponStore);
   let isWorn       = $state($isWornStore);
   let isGadget     = $state($isGadgetStore);
   let isTech       = $state($isTechStore);
   let isMagic      = $state($isMagicStore);

   $effect(() => {
      isFavorite   = $isFavoriteStore;
      isEquipped   = $isEquippedStore;
      isAmmunition = $isAmmunitionStore;
      isWeapon     = $isWeaponStore;
      isWorn       = $isWornStore;
      isGadget     = $isGadgetStore;
      isTech       = $isTechStore;
      isMagic      = $isMagicStore;
   });

   $effect(() => {
      isFavoriteStore.set(isFavorite);
      isEquippedStore.set(isEquipped);
      isAmmunitionStore.set(isAmmunition);
      isWeaponStore.set(isWeapon);
      isWornStore.set(isWorn);
      isGadgetStore.set(isGadget);
      isTechStore.set(isTech);
      isMagicStore.set(isMagic);
   });

   const INVENTORY_TYPES = ["ammunition", "weapon", "wearable", "gadget", "techinterface", "spell", "focus"];

   function rebuildAllItems() {
      allItems = [...((actor as any).items ?? [])].filter((i: any) => INVENTORY_TYPES.includes(i.type));
   }

   rebuildAllItems();

   const onItemChange = (item: any) => {
      if (item.parent?.id !== (actor as any).id) return;
      rebuildAllItems();
   };

   const createHookId = Hooks.on("createItem", onItemChange);
   const updateHookId = Hooks.on("updateItem", onItemChange);
   const deleteHookId = Hooks.on("deleteItem", onItemChange);

   $effect(() => {
      filteredItems = allItems.filter((entry) => {
         const item = entry.item || entry;

         const typeMatches =
            (isAmmunition && item.type === "ammunition") ||
            (isWeapon && item.type === "weapon") ||
            (isWorn && item.type === "wearable") ||
            (isGadget && item.type === "gadget") ||
            (isTech && item.type === "techinterface") ||
            (isMagic && (item.type === "spell" || item.type === "focus"));

         const hasTypeFilter = isAmmunition || isWeapon || isWorn || isGadget || isTech || isMagic;
         const passesTypeFilter = hasTypeFilter ? typeMatches : true;

         const itemFlags = item.flags?.sr3e || {};
         const passesFavoriteFilter = isFavorite ? itemFlags.isFavorite : true;
         const passesEquippedFilter = isEquipped ? itemFlags.isEquipped : true;

         return passesTypeFilter && passesFavoriteFilter && passesEquippedFilter;
      });
   });

   $effect(() => {
      const { cleanup } = setupPackery({
         container: gridContainer,
         itemSelector: ".asset-card-container",
         gridSizerSelector: ".asset-grid-sizer",
         gutterSizerSelector: ".asset-gutter-sizer",
      });
      return cleanup;
   });
</script>

<div class="asset-category-container static-full-width">
   <div class="asset-masonry-background-layer"></div>
   <FilterToggle
      bind:checked={isFavorite}
      label={localize(CONFIG.SR3E.INVENTORY.favourites)}
      svgName="star-svgrepo-com.svg"
   />
   <FilterToggle
      bind:checked={isEquipped}
      label={localize(CONFIG.SR3E.INVENTORY.equipped)}
      svgName="backpack-svgrepo-com.svg"
   />
   <FilterToggle
      bind:checked={isAmmunition}
      label={localize(CONFIG.SR3E.AMMUNITION.ammunition)}
      svgName="bullets-svgrepo-com.svg"
   />
   <FilterToggle bind:checked={isWeapon} label={localize(CONFIG.SR3E.WEAPON.weapon)} svgName="rifle-gun-svgrepo-com.svg" />
   <FilterToggle
      bind:checked={isWorn}
      label={localize(CONFIG.SR3E.WEARABLE.wearable)}
      svgName="coat-with-pockets-svgrepo-com.svg"
   />
   <FilterToggle bind:checked={isGadget} label={localize(CONFIG.SR3E.ITEM_TYPES.gadget)} svgName="cogs-f-svgrepo-com.svg" />
   <FilterToggle
      bind:checked={isTech}
      label={localize(CONFIG.SR3E.ITEM_TYPES.techinterface)}
      svgName="router-svgrepo-com.svg"
   />
   <FilterToggle bind:checked={isMagic} label={localize(CONFIG.SR3E.ITEM_TYPES.magic)} svgName="crystal-cluster-svgrepo-com.svg" />
</div>

<div class="asset-category-container static-full-width">
   <div class="asset-masonry-background-layer"></div>
   <div bind:this={gridContainer} class="asset-masonry-grid">
      <div class="asset-grid-sizer"></div>
      <div class="asset-gutter-sizer"></div>

      {#each filteredItems as item (item.id)}
         <div class="asset-card-container">
            <InventoryCard {actor} {item} />
         </div>
      {/each}
   </div>
</div>
