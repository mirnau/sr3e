<script>
   import AttributeCardCreationState from "./basic/AttributeCardCreationState.svelte";
   import AttributeCardKarmaState from "./basic/AttributeCardKarmaState.svelte";
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

   let intelligence = storeManager.GetCompositeStore("attributes.intelligence", ["value", "mod", "meta"]);
   let quickness = storeManager.GetCompositeStore("attributes.quickness", ["value", "mod", "meta"]);
   let magic = storeManager.GetCompositeStore("attributes.magic", ["value", "mod"]);
   let essence = storeManager.GetStore("attributes.essence");
   let magicValueStore = storeManager.GetStore("attributes.magic.value");
   let magicCap = $derived(Math.floor($essence));
   

   let reaction = $derived(Math.floor(($intelligence.sum + $quickness.sum) * 0.5));

   let augmentedReaction = $derived(reaction + getTotalModifiersFromItems());

   function getTotalModifiersFromItems() {
      ui.notifications.warn("This function is not implemented yet. Attributes.svelte");
      return 0;
   }

   $effect(() => {
      isAwakened = actor.items.some((item) => item.type === "magic") && !actor.system.attributes.magic.isBurnedOut;
      $magicValueStore = magicCap;
   });

   onDestroy(() => {
      StoreManager.Unsubscribe(actor);
   });
</script>

<CardToolbar {id} />
<h1>{localize(localization.attributes)}</h1>
<MasonryGrid itemSelector="stat-card" gridPrefix="attribute">
   {#each Object.entries(attributes).slice(0, 6) as [key, stat]}
      {#if !$attributeAssignmentLocked}
         <AttributeCardCreationState {actor} {stat} {localization} {key} />
      {:else}
         <AttributeCardKarmaState {actor} {stat} {localization} {key} />
      {/if}
   {/each}
   {#if isAwakened}
      <StatCard label={config.magic.magic} value={$magic.sum} />
   {/if}
   <StatCard label={config.initiative.reaction} value={reaction} />
   <StatCard label={config.initiative.augmentedReaction} value={augmentedReaction} />
</MasonryGrid>
