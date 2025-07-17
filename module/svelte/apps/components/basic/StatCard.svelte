<script>
   import { StoreManager, stores } from "../../../svelteHelpers/StoreManager.svelte.js";
   import { localize } from "../../../../services/utilities.js";
   import { onDestroy } from "svelte";

   let { document, value, label, isButton = false, key = "", children } = $props();

   let currentDicePoolSelectionStore;
   let isRollComposerOpen;

   if (document) {
      const storeManager = StoreManager.Subscribe(document);
      currentDicePoolSelectionStore = storeManager.GetShallowStore(document.id, stores.dicepoolSelection);
      isRollComposerOpen = storeManager.GetShallowStore(document.id, stores.isrollcomposeropen, false);

      onDestroy(() => {
         StoreManager.Unsubscribe(document);
      });
   }

   function provideSelectedDicepool(_) {
      if (currentDicePoolSelectionStore) $currentDicePoolSelectionStore = key;
   }

   const handleKeyDown = (e) => {
      if (e.key === "Enter" || e.key === " ") provideSelectedDicepool(e);
   };
</script>

{#if isButton && $isRollComposerOpen}
   <div
      class="stat-card button"
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
