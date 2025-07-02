<script>
   import AttributePointsState from "./AttributePointsState.svelte";
   import SkillPointsState from "./SkillPointsState.svelte";
   import { flags } from "../../../../services/commonConsts.js";
   import { StoreManager } from "../../../svelteHelpers/StoreManager.svelte";
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
