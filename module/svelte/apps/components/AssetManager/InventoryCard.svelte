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
</script>

<div class="asset-card">
   <div class="asset-background-layer"></div>
   <div class="image-mask">
      <img src={item.img} role="presentation" alt={item.name} />
   </div>
   <div class="asset-card-column">
      <div class="asset-card-row">
         <div class="asset-card-column">
            <h3 class="no-margin uppercase">{item.name}</h3>
            <h4 class="no-margin uppercase">{item.name}</h4>
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

         <button class="sr3e-toolbar-button fa-solid fa-trash-can" aria-label="Roll" onclick={() => console.log("Roll")}
         ></button>
      </div>
   </div>
   <div class="asset-toggles">
      <FilterToggle bind:checked={isFavorite} svgName="star-svgrepo-com.svg" />
      <FilterToggle bind:checked={isEquipped} svgName="backpack-svgrepo-com.svg" />
   </div>
</div>
