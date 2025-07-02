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

   let intelligence = storeManager.GetCompositeStore("attributes.intelligence", ["value", "mod", "meta"]);
   let willpower = storeManager.GetCompositeStore("attributes.willpower", ["value", "mod", "meta"]);
   let charisma = storeManager.GetCompositeStore("attributes.charisma", ["value", "mod", "meta"]);
   let quickness = storeManager.GetCompositeStore("attributes.quickness", ["value", "mod", "meta"]);

   let magic = storeManager.GetCompositeStore("attributes.magic", ["value", "mod"]);
   let combat = storeManager.GetStore("dicePools.combat.value");
   let control = storeManager.GetStore("dicePools.control.value");
   let hacking = storeManager.GetStore("dicePools.hacking.value");

   let reaction = $derived(Math.floor(($intelligence.sum + $quickness.sum) * 0.5));
   let combatPool = $derived(Math.floor(($intelligence.sum + $quickness.sum + $willpower.sum) * 0.5));
   let controlPool = 999; //Temp debug
   let hackingPool = 999; //Temp debug

   let astral = storeManager.GetStore("dicePools.astral.value");
   let spell = storeManager.GetStore("dicePools.spell.value");
   let astralPool = $derived(Math.floor(($intelligence.sum + $charisma.sum + $willpower.sum) * 0.5));
   let spellPool = $derived(Math.floor(($intelligence.sum + $magic.sum + $willpower.sum) * 0.5));

   onDestroy(() => {
      StoreManager.Unsubscribe(actor);
   });
</script>

<CardToolbar {id} />
<h1>{localize(config.dicepools.dicepools)}</h1>
<MasonryGrid itemSelector="stat-card" gridPrefix="attribute">
   <StatCard label={config.dicepools.combat} value={combatPool} />
   <StatCard label={config.dicepools.control} value={controlPool} />
   <StatCard label={config.dicepools.hacking} value={hackingPool} />
   {#if isAwakened}
      <StatCard label={config.dicepools.astral} value={astralPool} />
      <StatCard label={config.dicepools.spell} value={spellPool} />
   {/if}
</MasonryGrid>
