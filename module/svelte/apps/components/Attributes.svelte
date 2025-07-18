<script>
   import AttributeCard from "./basic/AttributeCard.svelte";
   import { localize } from "../../../services/utilities.js";
   import CardToolbar from "./CardToolbar.svelte";
   import MasonryGrid from "./basic/MasonryGrid.svelte";
   import { flags } from "../../../services/commonConsts.js";
   import { StoreManager } from "../../svelteHelpers/StoreManager.svelte";
   import { onDestroy } from "svelte";

   let { actor, config, id, span } = $props();

   const storeManager = StoreManager.Subscribe(actor);
   const attributes = $state(actor.system.attributes);
   const items = $state(actor.items);

   const attributeAssignmentLocked = storeManager.GetFlagStore(flags.attributeAssignmentLocked);

   const intelligence = storeManager.GetRWStore("attributes.intelligence");
   const quickness = storeManager.GetRWStore("attributes.quickness");
   const reaction = storeManager.GetRWStore("attributes.reaction");

   const magic = storeManager.GetRWStore("attributes.magic");
   const essence = storeManager.GetRWStore("attributes.essence");

   let isAwakened = $state(false);

   $effect(() => {
      isAwakened = items.some((item) => item.type === "magic") && !$magic.isBurnedOut;
   });

   $effect(() => {
      $reaction = Math.floor(($intelligence + $quickness) * 0.5);
   });

   onDestroy(() => {
      StoreManager.Unsubscribe(actor);
   });
</script>

<CardToolbar {id} />
<h1>{localize(config.attributes.attributes)}</h1>

<MasonryGrid itemSelector="stat-card" gridPrefix="attribute">
   {#each Object.keys(attributes).slice(0, 7) as key}
      <AttributeCard {actor} localization={config.attributes} {key} />
   {/each}

   {#if isAwakened}
      <AttributeCard {actor} localization={config.attributes} key="magic" />
   {/if}
</MasonryGrid>
