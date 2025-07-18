<script>
   import MasonryGrid from "./basic/MasonryGrid.svelte";
   import StatCard from "./basic/StatCard.svelte";
   import CardToolbar from "./CardToolbar.svelte";
   import { localize } from "../../../services/utilities.js";
   import { StoreManager } from "../../svelteHelpers/StoreManager.svelte";
   import { onDestroy } from "svelte";

   let { actor, config, id, span } = $props();

   const storeManager = StoreManager.Subscribe(actor);

   const intelligence = storeManager.GetRWStore("attributes.intelligence");
   const willpower = storeManager.GetRWStore("attributes.willpower");
   const charisma = storeManager.GetRWStore("attributes.charisma");
   const quickness = storeManager.GetRWStore("attributes.quickness");
   const reaction = storeManager.GetRWStore("attributes.reaction");
   const magic = storeManager.GetRWStore("attributes.magic");

   const combat = storeManager.GetRWStore("dicePools.combat");
   const control = storeManager.GetRWStore("dicePools.control");
   const hacking = storeManager.GetRWStore("dicePools.hacking");
   const astral = storeManager.GetRWStore("dicePools.astral");
   const spell = storeManager.GetRWStore("dicePools.spell");

   let isAwakened = $state(false);

   $effect(() => {
      isAwakened = actor.items.some(i => i.type === "magic") && !$magic.isBurnedOut;
   });

   $effect(() => {
      $control = $reaction;
      $combat = Math.floor(($intelligence + $quickness + $willpower) * 0.5);
      $astral = Math.floor(($intelligence + $charisma + $willpower) * 0.5);
      $spell = Math.floor(($intelligence + $magic + $willpower) * 0.5);
   });

   onDestroy(() => {
      StoreManager.Unsubscribe(actor);
   });
</script>

<CardToolbar {id} />
<h1>{localize(config.dicepools.dicepools)}</h1>

<MasonryGrid itemSelector="stat-card" gridPrefix="attribute">
   <StatCard document={actor} label={config.dicepools.combat} value={$combat} key="combat" isButton={true} />
   <StatCard document={actor} label={config.dicepools.control} value={$control} key="control" isButton={true} />
   <StatCard document={actor} label={config.dicepools.hacking} value={$hacking} key="hacking" isButton={true} />
   {#if isAwakened}
      <StatCard document={actor} label={config.dicepools.astral} value={$astral} key="astral" isButton={true} />
      <StatCard document={actor} label={config.dicepools.spell} value={$spell} key="spell" isButton={true} />
   {/if}
</MasonryGrid>
