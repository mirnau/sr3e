<script>
   import { StoreManager, stores } from "../../../svelteHelpers/StoreManager.svelte.js";
   import { localize } from "../../../../services/utilities.js";
   import { onDestroy } from "svelte";
   let { actor, value, label, isButton = false, key = "", children } = $props();

   const storeManager = StoreManager.Subscribe(actor);
   let currentDicePoolSelectionStore = storeManager.GetShallowStore(actor.id, stores.dicepoolSelection);
   let isRollComposerOpen = storeManager.GetShallowStore(actor.id, stores.isrollcomposeropen, false);

   onDestroy(() => {
      StoreManager.Unsubscribe(actor);
   });

   function provideSelectedDicepool(_) {
      $currentDicePoolSelectionStore = key;
   }

   const handleKeyDown = (e) => {
      if (e.key === "Enter" || e.key === " ") provideSelectedDicepool(e);
   };
</script>

{#if isButton && $isRollComposerOpen}
   <div
      class="stat-card"
      class:alert-animation={$isRollComposerOpen}
      role="button"
      tabindex="0"
      onclick={provideSelectedDicepool}
      onkeydown={handleKeyDown}
   >
      <div class="stat-card-background"></div>
      {#if label?.length > 0}
         <h4 class="no-margin uppercase">{localize(label)}</h4>
      {/if}
      {#if children}
         {@render children?.()}
      {:else}
         <h1 class="stat-value">{value}</h1>
      {/if}
   </div>
{:else}
   <div class="stat-card">
      <div class="stat-card-background"></div>
      {#if label?.length > 0}
         <h4 class="no-margin uppercase">{localize(label)}</h4>
      {/if}
      {#if children}
         {@render children?.()}
      {:else}
         <h1 class="stat-value">{value}</h1>
      {/if}
   </div>
{/if}
