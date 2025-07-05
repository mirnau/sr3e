<script>
   import AttributeCard from "./basic/AttributeCard.svelte";
   import { localize } from "../../../services/utilities.js";
   import { setupMasonry } from "../../../foundry/masonry/responsiveMasonry.js";
   import CardToolbar from "./CardToolbar.svelte";
   import StatCard from "./basic/StatCard.svelte";
   import { flags, masonryMinWidthFallbackValue } from "../../../services/commonConsts.js";
   import MasonryGrid from "./basic/MasonryGrid.svelte";
   import { StoreManager } from "../../svelteHelpers/StoreManager.svelte";
   import { onDestroy } from "svelte";

   let { actor = {}, config = {}, id = {}, span = {} } = $props();
   let attributes = $state(actor.system.attributes);
   let itemState = $state(actor.items);
   let isAwakened = $state(false);
   let localization = config.attributes;
   let storeManager = StoreManager.Subscribe(actor);

   let attributeAssignmentLocked = storeManager.GetFlagStore(flags.attributeAssignmentLocked);

   let intelligence = storeManager.GetSumROStore("attributes.intelligence");
   let quickness = storeManager.GetSumROStore("attributes.quickness");

   let magic = storeManager.GetSumROStore("attributes.magic");
   let essence = storeManager.GetSumROStore("attributes.essence");
   let reaction = storeManager.GetSumROStore("attributes.reaction");
   let reactionValue = storeManager.GetRWStore("attributes.reaction.value");

   $effect(() => {
      $reactionValue = Math.floor(($intelligence.sum + $quickness.sum) * 0.5);
   });

   $effect(() => {
      isAwakened = actor.items.some((item) => item.type === "magic") && !actor.system.attributes.magic.isBurnedOut;
   });

   onDestroy(() => {
      StoreManager.Unsubscribe(actor);
   });
</script>

<CardToolbar {id} />
<h1>{localize(localization.attributes)}</h1>
<MasonryGrid itemSelector="stat-card" gridPrefix="attribute">
   {#each Object.entries(attributes).slice(0, 6) as [key, stat]}
      <AttributeCard {actor} {stat} {localization} {key} />
   {/each}
   {#if isAwakened}
      <StatCard label={config.magic.magic} value={$magic.sum} />
   {/if}
   <StatCard label={config.initiative.reaction} value={$reaction.sum} />
</MasonryGrid>
