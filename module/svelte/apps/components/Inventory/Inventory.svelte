<script>
  import { getRandomIntinRange, localize } from "../../../../services/utilities.js";
  import {
    flags,
    inventory,
  } from "../../../../services/commonConsts.js";
  import CardToolbar from "../CardToolbar.svelte";
  import Garage from "./Garage.svelte";
  import Arsenal from "./Arsenal.svelte";
  import Effects from "./Effects.svelte";
  import ActorDataService from "../../../../services/ActorDataService.js";

  let { actor = {}, config = {}, id = {}, span = {} } = $props();
  let activeTab = $state(inventory.arsenal);

  let arsenal = ActorDataService.getInventoryCategory(actor, ["weapon", "ammunition"]);


</script>

<CardToolbar {id} />

<h1>{localize(config.inventory.inventory)}</h1>

<div class="sr3e-tabs">
  <button
    class:active={activeTab === inventory.arsenal}
    onclick={() => (activeTab = inventory.arsenal)}>Arsenal</button
  >
  <button
    class:active={activeTab === inventory.garage}
    onclick={() => (activeTab = inventory.garage)}>Garage</button
  >
  <button
    class:active={activeTab === inventory.effects}
    onclick={() => (activeTab = inventory.effects)}>Active Effects</button
  >
</div>

<div class="sr3e-inner-background">
  {#if activeTab === inventory.arsenal}
  <Arsenal {arsenal} {actor} {config} />
  {:else if activeTab === inventory.garage}
  <Garage {actor} {config} />
  {:else if activeTab === inventory.effects}
  <Effects {actor} {config} />
  {/if}
</div>

