<script lang="ts">
   import StatCard from "./basic/DerivedAttributeCard.svelte";
   import MasonryGrid from "./basic/MasonryGrid.svelte";
   import CardToolbar from "./CardToolbar.svelte";
   import { localize } from "@services/utilities.js";
   import { setupMasonry } from "../../../foundry/masonry/responsiveMasonry.js";
   import { shoppingState } from "../../../svelteStore.js";
   import { masonryMinWidthFallbackValue } from "@services/commonConsts.js";
   import { StoreManager } from "../../svelteHelpers/StoreManager.svelte";
   import { flags } from "@services/commonConsts.js";
   import { onDestroy } from "svelte";

   let { actor = {}, config = {}, id = {}, span = {} } = $props();

   let storeManager = StoreManager.Subscribe(actor);
   let isShoppingState = storeManager.GetFlagStore(flags.actor.isShoppingState);
   let attributePreview = storeManager.GetShallowStore(actor.id, "shoppingAttributePreview", { active: false, values: {} });
   onDestroy(() => StoreManager.Unsubscribe(actor));

   let quicknessStore = storeManager.GetSumROStore("attributes.quickness");
   let walking = storeManager.GetSumROStore("movement.walking");
   let walkingValue = storeManager.GetRWStore("movement.walking.value");
   let running = storeManager.GetSumROStore("movement.running");
   let runningValue = storeManager.GetRWStore("movement.running.value");

   let metatype = actor.items.find((i) => i.type === "metatype");

   $effect(() => {
      if (!metatype) return;
      const runningMod = metatype.system.movement.factor ?? 3;
      const quicknessPreview = $isShoppingState ? ($attributePreview?.values?.quickness ?? $quicknessStore.sum) : $quicknessStore.sum;
      $walkingValue = quicknessPreview;
      $runningValue = Math.floor(quicknessPreview * runningMod);
   });
</script>

<CardToolbar {id} />
<h1>{localize(config.movement.movement)}</h1>
<MasonryGrid itemSelector="stat-card" gridPrefix="attribute">
   <StatCard {actor} label={config.movement.walking} value={$walking.sum} />
   <StatCard {actor} label={config.movement.running} value={$running.sum} />
</MasonryGrid>
