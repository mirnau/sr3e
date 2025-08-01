<script>
   import MasonryGrid from "@sveltecomponent/basic/MasonryGrid.svelte";
   import StatCard from "@sveltecomponent/basic/DerivedAttributeCard.svelte";
   import CardToolbar from "@sveltecomponent/CardToolbar.svelte";
   import { localize } from "@services/utilities.js";
   import { StoreManager } from "@sveltehelpers/StoreManager.svelte";
   import { onDestroy } from "svelte";

   let { actor = {}, config = {}, id = {}, span = {} } = $props();

   let isAwakened = $state(false);

   $effect(() => {
      isAwakened = actor.items.some((item) => item.type === "magic") && !actor.system.attributes.magic.isBurnedOut;
   });

   const storeManager = StoreManager.Subscribe(actor);

   let intelligence = storeManager.GetSumROStore("attributes.intelligence");
   let willpower = storeManager.GetSumROStore("attributes.willpower");
   let charisma = storeManager.GetSumROStore("attributes.charisma");
   let quickness = storeManager.GetSumROStore("attributes.quickness");
   let reaction = storeManager.GetSumROStore("attributes.reaction");
   let magic = storeManager.GetSumROStore("attributes.magic");

   let combat = storeManager.GetSumROStore("dicePools.combat");
   let combatValueStore = storeManager.GetRWStore("dicePools.combat.value");

   let control = storeManager.GetSumROStore("dicePools.control");
   let controlValueStore = storeManager.GetRWStore("dicePools.control.value");

   let hacking = storeManager.GetSumROStore("dicePools.hacking");
   // hacking is fixed so no need to write to value directly

   let astral = storeManager.GetSumROStore("dicePools.astral");
   let astralValueStore = storeManager.GetRWStore("dicePools.astral.value");

   let spell = storeManager.GetSumROStore("dicePools.spell");
   let spellValueStore = storeManager.GetRWStore("dicePools.spell.value");

   $effect(() => {
      $controlValueStore = $reaction.sum;
      $combatValueStore = Math.floor(($intelligence.sum + $quickness.sum + $willpower.sum) * 0.5);
      $astralValueStore = Math.floor(($intelligence.sum + $charisma.sum + $willpower.sum) * 0.5);
      $spellValueStore = Math.floor(($intelligence.sum + $magic.sum + $willpower.sum) * 0.5);
   });

   onDestroy(() => {
      StoreManager.Unsubscribe(actor);
   });
</script>

<CardToolbar {id} />
<h1>{localize(config.dicepools.dicepools)}</h1>
<MasonryGrid itemSelector="stat-card" gridPrefix="attribute">
   <StatCard document={actor} label={config.dicepools.combat} value={$combat.sum} key="combat" isButton={true} />
   <StatCard document={actor} label={config.dicepools.control} value={$control.sum} key="control" isButton={true} />
   <StatCard document={actor} label={config.dicepools.hacking} value={$hacking.sum} key="hacking" isButton={true} />
   {#if isAwakened}
      <StatCard document={actor} label={config.dicepools.astral} value={$astral.sum} key="astral" isButton={true} />
      <StatCard document={actor} label={config.dicepools.spell} value={$spell.sum} key="spell" isButton={true} />
   {/if}
</MasonryGrid>
