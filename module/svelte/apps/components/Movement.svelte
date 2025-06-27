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
   let quickness = storeManager.GetCompositeStore("attributes.quickness", ["value", "mod", "meta"]);

   let runningmodifier = $state(3);

   $effect(() => {
      const metaType = actor.items.find((i) => i.type === "metatype");
      runningmodifier = metaType.system.movement.modifier;
   });

   let walking = $state($quickness.sum);
   let running = $derived($quickness.sum * runningmodifier);
</script>

<CardToolbar {id} />
<h1>{localize(config.movement.movement)}</h1>
<MasonryGrid itemSelector="stat-card" gridPrefix="attribute">
   <StatCard label={config.movement.walking} value={$quickness.sum} />
   <StatCard label={config.movement.running} value={running} />
</MasonryGrid>