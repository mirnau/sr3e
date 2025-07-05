<script>
   import MasonryGrid from "./basic/MasonryGrid.svelte";
   import StatCard from "./basic/StatCard.svelte";
   import CardToolbar from "./CardToolbar.svelte";
   import { localize } from "../../../services/utilities.js";
   import { setupMasonry } from "../../../foundry/masonry/responsiveMasonry.js";
   import { shoppingState } from "../../../svelteStore.js";
   import { StoreManager } from "../../svelteHelpers/StoreManager.svelte";
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
   let combatValue = storeManager.GetRWStore("dicePools.combat.value");

   let control = storeManager.GetSumROStore("dicePools.control");
   let controlValue = storeManager.GetRWStore("dicePools.control.value");

   let hacking = storeManager.GetSumROStore("dicePools.hacking");

   let astral = storeManager.GetSumROStore("dicePools.astral");
   let astralValue = storeManager.GetRWStore("dicePools.astral.value");

   let spell = storeManager.GetSumROStore("dicePools.spell");
   let spellValue = storeManager.GetRWStore("dicePools.spell.value");

   $effect(() => {
      $controlValue = $reaction.sum;
      $combatValue = Math.floor(($intelligence.sum + $quickness.sum + $willpower.sum) * 0.5);
      $astralValue = Math.floor(($intelligence.sum + $charisma.sum + $willpower.sum) * 0.5);
      $spellValue = Math.floor(($intelligence.sum + $magic.sum + $willpower.sum) * 0.5);
   });

   onDestroy(() => {
      StoreManager.Unsubscribe(actor);
   });
</script>

<CardToolbar {id} />
<h1>{localize(config.dicepools.dicepools)}</h1>
<MasonryGrid itemSelector="stat-card" gridPrefix="attribute">
   <StatCard label={config.dicepools.combat} value={$combat.sum} />
   <StatCard label={config.dicepools.control} value={$control.sum} />
   <StatCard label={config.dicepools.hacking} value={$hacking.sum} />
   {#if isAwakened}
      <StatCard label={config.dicepools.astral} value={$astral.sum} />
      <StatCard label={config.dicepools.spell} value={$spell.sum} />
   {/if}
</MasonryGrid>
