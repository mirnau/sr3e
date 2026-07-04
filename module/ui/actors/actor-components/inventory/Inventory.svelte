<script lang="ts">
   import { setupPackery } from "../../../../ui/Packery/setupPackery";
   import { StoreManager } from "../../../../utilities/StoreManager.svelte";
   import { onDestroy, untrack } from "svelte";
   import { localize } from "../../../../services/utilities";
   import FilterToggle from "./FilterToggle.svelte";
   import InventoryCard from "./InventoryCard.svelte";
   import { inventoryModeFor, isWeightExempt, mountUsage, INVENTORY_PRIMARY_FLAG, INVENTORY_SECONDARY_FLAG } from "./inventoryMode";

   const p = $props<{ actor: Actor }>();
   const actor = untrack(() => p.actor);
   const mode = inventoryModeFor(actor);
   const isVehicle = mode === "vehicle";

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

   const strengthStore = storeManager.GetSimpleStatROStore(actor, "attributes.strength");
   const loadStore = storeManager.GetSimpleStatROStore(actor, "load");
   const hardpointCapacityStore = storeManager.GetSimpleStatROStore(actor, "mounts.hardpoints");
   const firmpointCapacityStore = storeManager.GetSimpleStatROStore(actor, "mounts.firmpoints");

   const isPrimaryStore    = storeManager.GetFlagStore<boolean>(actor, INVENTORY_PRIMARY_FLAG[mode],   false);
   const isSecondaryStore  = storeManager.GetFlagStore<boolean>(actor, INVENTORY_SECONDARY_FLAG[mode], false);
   const isAmmunitionStore = storeManager.GetFlagStore<boolean>(actor, "isAmmunition", false);
   const isWeaponStore     = storeManager.GetFlagStore<boolean>(actor, "isWeapon",     false);
   const isWornStore       = storeManager.GetFlagStore<boolean>(actor, "isWorn",       false);
   const isGadgetStore     = storeManager.GetFlagStore<boolean>(actor, "isGadget",     false);
   const isTechStore       = storeManager.GetFlagStore<boolean>(actor, "isTech",       false);
   const isMagicStore      = storeManager.GetFlagStore<boolean>(actor, "isMagic",      false);

   let isPrimary    = $state($isPrimaryStore);
   let isSecondary  = $state($isSecondaryStore);
   let isAmmunition = $state($isAmmunitionStore);
   let isWeapon     = $state($isWeaponStore);
   let isWorn       = $state($isWornStore);
   let isGadget     = $state($isGadgetStore);
   let isTech       = $state($isTechStore);
   let isMagic      = $state($isMagicStore);

   $effect(() => {
      isPrimary    = $isPrimaryStore;
      isSecondary  = $isSecondaryStore;
      isAmmunition = $isAmmunitionStore;
      isWeapon     = $isWeaponStore;
      isWorn       = $isWornStore;
      isGadget     = $isGadgetStore;
      isTech       = $isTechStore;
      isMagic      = $isMagicStore;
   });

   $effect(() => {
      isPrimaryStore.set(isPrimary);
      isSecondaryStore.set(isSecondary);
      isAmmunitionStore.set(isAmmunition);
      isWeaponStore.set(isWeapon);
      isWornStore.set(isWorn);
      isGadgetStore.set(isGadget);
      isTechStore.set(isTech);
      isMagicStore.set(isMagic);
   });

   const INVENTORY_TYPES = ["ammunition", "weapon", "wearable", "gadget", "techinterface", "medical", "focus"];

   const capacity = $derived(isVehicle ? $loadStore : $strengthStore * 5);
   const totalWeight = $derived(
      Math.round(allItems.reduce((sum, item) => {
         if (isWeightExempt(mode, item)) return sum;
         return sum + (item.system?.portability?.weight ?? 0);
      }, 0) * 100) / 100
   );
   const isOverencumbered = $derived(totalWeight > capacity);

   const usage = $derived(mountUsage(mode, allItems));
   const hardpointFull = $derived(isVehicle && usage.hardpointCount >= $hardpointCapacityStore);
   const firmpointFull = $derived(isVehicle && usage.firmpointCount >= $firmpointCapacityStore);

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
            (isMagic && item.type === "focus");

         const hasTypeFilter = isAmmunition || isWeapon || isWorn || isGadget || isTech || isMagic;
         const passesTypeFilter = hasTypeFilter ? typeMatches : true;

         const itemFlags = item.flags?.sr3e || {};
         const passesPrimaryFilter = isPrimary ? itemFlags[INVENTORY_PRIMARY_FLAG[mode]] : true;
         const passesSecondaryFilter = isSecondary ? itemFlags[INVENTORY_SECONDARY_FLAG[mode]] : true;

         return passesTypeFilter && passesPrimaryFilter && passesSecondaryFilter;
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
   {#if isVehicle}
      <FilterToggle
         bind:checked={isPrimary}
         label={localize(CONFIG.SR3E.MECHANICAL.hardpoint)}
         letter="H"
      />
      <FilterToggle
         bind:checked={isSecondary}
         label={localize(CONFIG.SR3E.MECHANICAL.firmpoint)}
         letter="F"
      />
   {:else}
      <FilterToggle
         bind:checked={isPrimary}
         label={localize(CONFIG.SR3E.INVENTORY.favourites)}
         svgName="star-svgrepo-com.svg"
      />
      <FilterToggle
         bind:checked={isSecondary}
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
   {/if}
   <div class="inventory-total-weight">
      <span class:overencumbered={isOverencumbered}>
         {localize(CONFIG.SR3E.INVENTORY.totalweight)}:
         {#if isVehicle}
            {totalWeight} / {capacity}
         {:else}
            {totalWeight}
         {/if}
         {localize(CONFIG.SR3E.PORTABILITY.weightunit)}
      </span>
   </div>
</div>

<div class="asset-category-container static-full-width">
   <div class="asset-masonry-background-layer"></div>
   <div bind:this={gridContainer} class="asset-masonry-grid">
      <div class="asset-grid-sizer"></div>
      <div class="asset-gutter-sizer"></div>

      {#each filteredItems as item (item.id)}
         <div class="asset-card-container">
            <InventoryCard {actor} {item} {hardpointFull} {firmpointFull} />
         </div>
      {/each}
   </div>
</div>
