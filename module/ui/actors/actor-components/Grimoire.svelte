<script lang="ts">
import { onDestroy, untrack } from "svelte";
import { setupPackery } from "../../../ui/Packery/setupPackery";
import { localize } from "../../../services/utilities";
import { StoreManager } from "../../../utilities/StoreManager.svelte";
import InventoryCard from "./inventory/InventoryCard.svelte";
import FilterToggle from "./inventory/FilterToggle.svelte";

const p = $props<{ actor: Actor; spells: Item[] }>();
const actor = untrack(() => p.actor);
const storeManager = StoreManager.Instance;
storeManager.Subscribe(actor);

const isFavoriteStore = storeManager.GetFlagStore<boolean>(actor, "isGrimoireFavorite", false);

let gridContainer: HTMLElement;
let isFavorite = $state($isFavoriteStore);

const filteredSpells = $derived(
   isFavorite ? p.spells.filter((item: any) => item.flags?.sr3e?.isFavorite) : p.spells,
);

$effect(() => {
   isFavorite = $isFavoriteStore;
});

$effect(() => {
   isFavoriteStore.set(isFavorite);
});

onDestroy(() => {
   storeManager.Unsubscribe(actor);
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

<div class="grimoire-component">
   <div class="asset-category-container static-full-width grimoire-category">
      <div class="asset-masonry-background-layer"></div>
      <FilterToggle
         bind:checked={isFavorite}
         label={localize(CONFIG.SR3E.INVENTORY.favourites)}
         svgName="star-svgrepo-com.svg"
      />
   </div>

   <div class="asset-category-container static-full-width grimoire-category">
      <div class="asset-masonry-background-layer"></div>
      <div bind:this={gridContainer} class="asset-masonry-grid">
         <div class="asset-grid-sizer"></div>
         <div class="asset-gutter-sizer"></div>

         {#each filteredSpells as item (item.id)}
            <div class="asset-card-container grimoire-spell-card-container">
               <InventoryCard {actor} {item} />
            </div>
         {/each}
      </div>
   </div>
</div>
