<script>
   import { onDestroy, onMount } from "svelte";
   import { StoreManager } from "../../../svelteHelpers/StoreManager.svelte";
   import FilterToggle from "@sveltecomponent/AssetManager/FilterToggle.svelte";
   import { localize } from "@services/utilities.js";

   let { item, config } = $props();
   let isFavorite = $state(false);
   let isEquipped = $state(false);

   const storeManager = StoreManager.Subscribe(item);
   const isFavoriteStore = storeManager.GetFlagStore("isFavorite");
   const isEquippedStore = storeManager.GetFlagStore("isEquipped");

   onMount(() => {
      isFavorite = $isFavoriteStore;
      isEquipped = $isEquippedStore;
   });

   $effect(() => {
      $isFavoriteStore = isFavorite;
      $isEquippedStore = isEquipped;
   });

   onDestroy(() => {
      StoreManager.Unsubscribe(item);
   });

   // Generic macro-bar-compatible drag payload
   function onDragStart(event) {
      if (!item?.uuid) return;
      const payload = {
         type: item.documentName ?? "Item",
         uuid: item.uuid,
      };
      event.dataTransfer?.setData("text/plain", JSON.stringify(payload));
      if (event.currentTarget instanceof HTMLElement) event.dataTransfer.setDragImage(event.currentTarget, 16, 16);
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
            <h3 class="no-margin uppercase">Skill : {item.name}</h3>
            {#if item.type === "weapon"}
               <h4 class="no-margin uppercase">¥ {item.system.commodity.cost} - {item.system.mode}</h4>
            {/if}
         </div>
      </div>
      <div class="asset-card-row">
         <button class="sr3e-toolbar-button fa-solid fa-dice" aria-label="Roll" onclick={() => console.log("Roll")}
         ></button>
         <button
            class="sr3e-toolbar-button fa-solid fa-pencil"
            aria-label="Edit"
            onclick={() => {
               item.sheet.render(true);
            }}
         ></button>
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
