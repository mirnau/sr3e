<script>
   import AttributeCard from "./basic/AttributeCard.svelte";
   import { localize } from "@services/utilities.js";
   import CardToolbar from "./CardToolbar.svelte";
   import { flags } from "@services/commonConsts.js";
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
   {#each Object.keys(attributes).slice(0, 7) as key}
      <AttributeCard {actor} {localization} {key} />
   {/each}

   {#if isAwakened}
      <AttributeCard {actor} {localization} key="magic" />
   {/if}

</MasonryGrid>
