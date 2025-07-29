<script>
   import { getRandomIntinRange, localize } from "@services/utilities.js";
   import { flags, inventory } from "@services/commonConsts.js";
   import CardToolbar from "../CardToolbar.svelte";
   import Garage from "./Garage.svelte";
   import Effects from "./Effects.svelte";
   
   import Inventory from "./Inventory.svelte";

   let { actor = {}, config = {}, id = {}, span = {} } = $props();
   let activeTab = $state(inventory.inventory);
   
</script>

<CardToolbar {id} />

<h1>{localize(config.inventory.inventory)}</h1>

<div class="sr3e-tabs">
   <button class="fa-solid fa-suitcase-rolling" class:active={activeTab === inventory.inventory} onclick={() => (activeTab = inventory.inventory)}
      >Stuff</button
   >
   <button class="fa-solid fa-truck-monster" class:active={activeTab === inventory.garage} onclick={() => (activeTab = inventory.garage)}
      >Garage</button
   >
   <button class="" class:active={activeTab === inventory.effects} onclick={() => (activeTab = inventory.effects)}
      >Active Effects</button
   >
</div>

<div class="sr3e-inner-background">
   {#if activeTab === inventory.inventory}
      <Inventory {actor} {config} />
   {:else if activeTab === inventory.garage}
      <Garage {actor} {config} />
   {:else if activeTab === inventory.effects}
      <Effects {actor} {config} />
   {/if}
</div>
