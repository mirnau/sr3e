<script>
   import { localize } from "@services/utilities.js";
   import { setupMasonry } from "../../../foundry/masonry/responsiveMasonry.js";
   import { shoppingState } from "../../../svelteStore.js";
   import { masonryMinWidthFallbackValue } from "@services/commonConsts.js";
   import CardToolbar from "./CardToolbar.svelte";
   import MasonryGrid from "./basic/MasonryGrid.svelte";
   import StatCard from "./basic/DerivedAttributeCard.svelte";
   import { StoreManager } from "../../svelteHelpers/StoreManager.svelte.js";

   let { actor = {}, config = {}, id = {}, span = {} } = $props();
   let storeManager = StoreManager.Subscribe(actor);

   let karmaPoolStore = storeManager.GetSumROStore("karma.karmaPool");
   let goodKarmaStore = storeManager.GetRWStore("karma.goodKarma");
   let essenceStore = storeManager.GetSumROStore("attributes.essence");

</script>

<CardToolbar {id} />
<h1>{localize(config.karma.karma)}</h1>
<MasonryGrid itemSelector="stat-card" gridPrefix="attribute">
   <StatCard {actor} label={localize(config.karma.goodkarma)} value={$goodKarmaStore} />
   <StatCard {actor} label={localize(config.karma.karmapool)} value={$karmaPoolStore.sum} />
   <StatCard {actor} label={localize(config.attributes.essence)} value={$essenceStore.sum} />
</MasonryGrid>
