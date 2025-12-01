<script lang="ts">
   import AttributePointsState from "@injections/charactercreation/AttributePointsState.svelte";
   import SkillPointsState from "@injections/charactercreation/SkillPointsState.svelte";

   import { flags } from "@services/commonConsts.js";
   import { StoreManager } from "@sveltehelpers/StoreManager.svelte";
   import { onDestroy } from "svelte";
   let { actor = {}, config = {} } = $props();

   let storeManager = StoreManager.Subscribe(actor);
   onDestroy(() => {
      StoreManager.Unsubscribe(actor);
   });

   let attributeAssignementLockedStore = storeManager.GetFlagStore(flags.actor.attributeAssignmentLocked);
   let isCharacterCreationStore = storeManager.GetFlagStore(flags.actor.isCharacterCreation);
</script>

{#if $isCharacterCreationStore}
   <div>
      {#if $attributeAssignementLockedStore}
         <SkillPointsState {actor} {config} />
      {:else}
         <AttributePointsState {actor} {config} />
      {/if}
   </div>
{/if}
