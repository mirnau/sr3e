<script>
   import StatCard from "./basic/StatCard.svelte";
   import MasonryGrid from "./basic/MasonryGrid.svelte";
   import CardToolbar from "./CardToolbar.svelte";
   import { localize } from "../../../services/utilities.js";
   import { setupMasonry } from "../../../foundry/masonry/responsiveMasonry.js";
   import { shoppingState } from "../../../svelteStore.js";
   import { masonryMinWidthFallbackValue } from "../../../services/commonConsts.js";
   import { StoreManager } from "../../svelteHelpers/StoreManager.svelte";

   let { actor = {}, config = {}, id = {}, span = {} } = $props();

   let storeManager = StoreManager.Subscribe(actor);
   let walking = storeManager.GetSumROStore("movement.walking");
   let running = storeManager.GetSumROStore("movement.running");

</script>

<CardToolbar {id} />
<h1>{localize(config.movement.movement)}</h1>
<MasonryGrid itemSelector="stat-card" gridPrefix="attribute">
   <StatCard label={config.movement.walking} value={$walking.sum} />
   <StatCard label={config.movement.running} value={$running.sum} />
</MasonryGrid>