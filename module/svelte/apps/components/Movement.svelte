<script>
   import StatCard from "./basic/StatCard.svelte";
   import MasonryGrid from "./basic/MasonryGrid.svelte";
   import CardToolbar from "./CardToolbar.svelte";
   import { localize } from "../../../services/utilities.js";
   import { StoreManager } from "../../svelteHelpers/StoreManager.svelte";
   import { onDestroy } from "svelte";

   let { actor, config, id, span } = $props();

   const storeManager = StoreManager.Subscribe(actor);
   onDestroy(() => StoreManager.Unsubscribe(actor));

   const quickness = storeManager.GetRWStore("attributes.quickness");

   const walking = storeManager.GetRWStore("movement.walking");
   const running = storeManager.GetRWStore("movement.running");

   $effect(() => {
      $walking = $quickness;
      $running = $quickness;
   });
</script>

<CardToolbar {id} />
<h1>{localize(config.movement.movement)}</h1>

<MasonryGrid itemSelector="stat-card" gridPrefix="attribute">
   <StatCard {actor} label={config.movement.walking} value={$walking} />
   <StatCard {actor} label={config.movement.running} value={$running} />
</MasonryGrid>
