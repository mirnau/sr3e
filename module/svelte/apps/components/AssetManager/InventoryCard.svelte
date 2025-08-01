<script>
   import { onDestroy, onMount } from "svelte";
   import { StoreManager } from "../../../svelteHelpers/StoreManager.svelte";
   import FilterToggle from "@sveltecomponent/AssetManager/FilterToggle.svelte";
   import { localize } from "@services/utilities.js";

   let { item, config } = $props();
   const inventoryCardStoreManager = StoreManager.Subscribe(item);

   let isFavorite = $state(false);
   let isEquipped = $state(false);

   const resolvingItemIdStore = inventoryCardStoreManager.GetRWStore("linkedSkilliD");
   const hasLinkedSkill = $derived($resolvingItemIdStore && $resolvingItemIdStore !== "");
   let resolvingItemName = $state("");

   const isFavoriteStore = inventoryCardStoreManager.GetFlagStore("isFavorite");
   const isEquippedStore = inventoryCardStoreManager.GetFlagStore("isEquipped");

   onMount(() => {
      isFavorite = $isFavoriteStore;
      isEquipped = $isEquippedStore;
   });

   $effect(() => {
      $isFavoriteStore = isFavorite;
      $isEquippedStore = isEquipped;
   });

   $effect(() => {
      if (hasLinkedSkill) {
         const skill = item.parent.items.get($resolvingItemIdStore);
         resolvingItemName = skill.name;
      }
   });

   onDestroy(() => {
      StoreManager.Unsubscribe(item);
   });

   function onDragStart(event) {
      const payload = {
         type: item.documentName ?? "Item",
         uuid: item.uuid,
      };
      event.dataTransfer.setData("text/plain", JSON.stringify(payload));
      if (event.currentTarget instanceof HTMLElement) {
         event.dataTransfer.setDragImage(event.currentTarget, 16, 16);
      }
   }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="asset-card" draggable="true" ondragstart={onDragStart}>
   <div class="asset-background-layer"></div>
   <div class="image-mask">
      <img src={item.img} role="presentation" alt={item.name} />
   </div>
   <div class="asset-card-column">
      <div class="asset-card-row">
         <div class="asset-card-column">
            <h3 class="no-margin uppercase">{item.name}</h3>
            {#if hasLinkedSkill}
               <h3 class="no-margin uppercase">{localize(config.skill.skill)}: {resolvingItemName}</h3>
            {/if}
            {#if item.type === "weapon"}
               <h4 class="no-margin uppercase">¥ {item.system.commodity.cost} - {item.system.mode}</h4>
            {/if}
         </div>
      </div>
      <div class="asset-card-row">
         <button
            class="sr3e-toolbar-button fa-solid fa-dice"
            aria-label="Roll"
            onclick={() => console.log("Roll")}
            disabled={!hasLinkedSkill}
         ></button>

         <button
            class="sr3e-toolbar-button fa-solid fa-pencil"
            aria-label="Edit"
            onclick={() => item.sheet.render(true)}
         ></button>
         {#if item.type === "weapon"}
            <button
               class="sr3e-toolbar-button fa-solid fa-repeat"
               aria-label="Trash"
               onclick={() => console.log("Reload")}
            ></button>
         {/if}
         <button
            class="sr3e-toolbar-button fa-solid fa-trash-can"
            aria-label="Trash"
            onclick={() => console.log("Trash")}
         ></button>
      </div>
   </div>
   <div class="asset-toggles">
      <FilterToggle bind:checked={isFavorite} svgName="star-svgrepo-com.svg" />
      <FilterToggle bind:checked={isEquipped} svgName="backpack-svgrepo-com.svg" />
   </div>
</div>
