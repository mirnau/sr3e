<script>
   import StatCard from "./basic/StatCard.svelte";
   import MasonryGrid from "./basic/MasonryGrid.svelte";
   import CardToolbar from "./CardToolbar.svelte";
   import { localize } from "../../../services/utilities.js";
   import { StoreManager } from "../../svelteHelpers/StoreManager.svelte";
   import { onDestroy } from "svelte";

   let { actor = {}, config = {}, id = {}, span = {} } = $props();

   const storeManager = StoreManager.Subscribe(actor);
   onDestroy(() => StoreManager.Unsubscribe(actor));

   let quickness = storeManager.GetSumROStore("attributes.quickness");

   let walking = storeManager.GetSumROStore("movement.walking");
   let walkingValueStore = storeManager.GetRWStore("movement.walking.value");

   let running = storeManager.GetSumROStore("movement.running");
   let runningValueStore = storeManager.GetRWStore("movement.running.value");

   $effect(() => {
      $walkingValueStore = $quickness.sum;
      $runningValueStore = $quickness.sum;
   });
</script>

<CardToolbar {id} />
<h1>{localize(config.movement.movement)}</h1>

<MasonryGrid itemSelector="stat-card" gridPrefix="attribute">
   <StatCard {actor} label={config.movement.walking} value={$walking.sum} />
   <StatCard {actor} label={config.movement.running} value={$running.sum} />
</MasonryGrid>
