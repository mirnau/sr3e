<script lang="ts">
import { onDestroy, untrack } from "svelte";
import { writable } from "svelte/store";
import { setupPackery } from "../../../ui/Packery/setupPackery";
import { localize } from "../../../services/utilities";
import { StoreManager } from "../../../utilities/StoreManager.svelte";
import { getAdeptMagicItem, buyPowerPoints, spendPowerPoints } from "../../../services/magic/adeptPowerPoints";
import { BuyPowerPointsDialogApp } from "../../../sheets/actors/BuyPowerPointsDialogApp";
import { SpendPowerPointsDialogApp } from "../../../sheets/actors/SpendPowerPointsDialogApp";
import InventoryCard from "./inventory/InventoryCard.svelte";
import FilterToggle from "./inventory/FilterToggle.svelte";

const p = $props<{ actor: Actor; items: Item[] }>();
const actor = untrack(() => p.actor);
const storeManager = StoreManager.Instance;
storeManager.Subscribe(actor);

const isFavoriteStore = storeManager.GetFlagStore<boolean>(actor, "isGrimoireFavorite", false);
const adeptMagicItem = untrack(() => getAdeptMagicItem(actor as never));
if (adeptMagicItem) storeManager.Subscribe(adeptMagicItem);
const powerPointsStore = adeptMagicItem
   ? storeManager.GetRWStore<number>(adeptMagicItem, "adeptData.powerPoints")
   : writable(0);
const goodKarmaStore = storeManager.GetRWStore<number>(actor, "karma.goodKarma");

let gridContainer: HTMLElement;
let isFavorite = $state($isFavoriteStore);

const filteredItems = $derived(
   isFavorite ? p.items.filter((item: any) => item.flags?.sr3e?.isFavorite) : p.items,
);

async function onBuyPowerPoints() {
   new BuyPowerPointsDialogApp($goodKarmaStore ?? 0, async (quantity: number) => {
      await buyPowerPoints(actor as never, quantity);
   }).render(true);
}

async function onSpendPowerPoints() {
   new SpendPowerPointsDialogApp($powerPointsStore ?? 0, async (quantity: number) => {
      await spendPowerPoints(actor as never, quantity);
   }).render(true);
}

$effect(() => {
   isFavorite = $isFavoriteStore;
});

$effect(() => {
   isFavoriteStore.set(isFavorite);
});

onDestroy(() => {
   storeManager.Unsubscribe(actor);
   if (adeptMagicItem) storeManager.Unsubscribe(adeptMagicItem);
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
      {#if adeptMagicItem}
         <span class="grimoire-power-points">
            {localize(CONFIG.SR3E.ADEPT_POWER.powerPointsAvailable)}: {$powerPointsStore ?? 0}
         </span>
         <button type="button" class="grimoire-buy-power-points" onclick={onSpendPowerPoints}>
            {localize(CONFIG.SR3E.ADEPT_POWER.spendPowerPoints)}
         </button>
         <button type="button" class="grimoire-buy-power-points" onclick={onBuyPowerPoints}>
            {localize(CONFIG.SR3E.ADEPT_POWER.buyPowerPoints)}
         </button>
      {/if}
   </div>

   <div class="asset-category-container static-full-width grimoire-category">
      <div class="asset-masonry-background-layer"></div>
      <div bind:this={gridContainer} class="asset-masonry-grid">
         <div class="asset-grid-sizer"></div>
         <div class="asset-gutter-sizer"></div>

         {#each filteredItems as item (item.id)}
            <div class="asset-card-container grimoire-spell-card-container">
               <InventoryCard {actor} {item} />
            </div>
         {/each}
      </div>
   </div>
</div>
