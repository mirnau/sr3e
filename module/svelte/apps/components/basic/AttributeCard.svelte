<script>
   import { localize } from "../../../../services/utilities.js";
   import { flags } from "../../../../services/commonConsts.js";
   import { StoreManager, stores } from "../../../svelteHelpers/StoreManager.svelte.js";
   import { onDestroy } from "svelte";
   import { mount, unmount } from "svelte";
   import RollComposerComponent from "../../components/RollComposerComponent.svelte";

   let { actor, localization, key } = $props();

   const storeManager = StoreManager.Subscribe(actor);
   onDestroy(() => StoreManager.Unsubscribe(actor));

   let valueStore = storeManager.GetRWStore(`attributes.${key}`);
   let attributePointStore = storeManager.GetRWStore("creation.attributePoints");

   let isShoppingState = storeManager.GetFlagStore(flags.actor.isShoppingState);
   let attributeAssignmentLockedStore = storeManager.GetFlagStore(flags.actor.attributeAssignmentLocked);
   let currentDicePoolSelectionStore = storeManager.GetShallowStore(actor.id, stores.dicepoolSelection);

   let metatype = $derived(actor.items.find((i) => i.type === "metatype") || []);
   let attributeLimit = $derived(key === "magic" ? null : (metatype.system.attributeLimits[key] ?? 0));

   let committedValue = null;
   let isMinLimit = $state(false);

   $effect(() => {
      if ($isShoppingState && $attributeAssignmentLockedStore && committedValue === null) {
         committedValue = $valueStore;
      }
   });

   $effect(() => {
      if ($isShoppingState && $attributeAssignmentLockedStore && committedValue !== null) {
         isMinLimit = $valueStore <= committedValue;
      } else {
         isMinLimit = $valueStore <= 1;
      }
   });

   // Ensure minimum value of 1 if negative modifiers dropped it too low during assignment
   $effect(() => {
      if (!$attributeAssignmentLockedStore && $isShoppingState && $valueStore < 1) {
         let deficit = 1 - $valueStore;
         while (deficit > 0 && $attributePointStore > 0) {
            $attributePointStore -= 1;
            $valueStore += 1;
            deficit -= 1;
         }
      }
   });

   function add(change) {
      if (!$attributeAssignmentLockedStore && $isShoppingState) {
         const newPoints = $attributePointStore - change;
         const newValue = $valueStore + change;

         if (newPoints >= 0 && (attributeLimit === null || newValue <= attributeLimit)) {
            $attributePointStore = newPoints;
            $valueStore = newValue;
         }
      }
   }

   const increment = () => add(1);
   const decrement = () => {
      if (!isMinLimit) add(-1);
   };

   let activeModal = null;
   let isModalOpen = $state(false);

   function handleEscape(e) {
      if (e.key === "Escape" && activeModal) {
         e.preventDefault();
         e.stopImmediatePropagation();
         unmount(activeModal);
         isModalOpen = false;
         activeModal = null;
      }
   }

   async function Roll(e) {
      if (e.shiftKey) {
         if (isModalOpen) return;
         isModalOpen = true;

         const options = await new Promise((resolve) => {
            activeModal = mount(RollComposerComponent, {
               target: document.querySelector(".composer-position"),
               props: {
                  actor,
                  config: CONFIG.sr3e,
                  caller: { key, value: $valueStore, type: "attribute", dice: $valueStore },
                  onclose: (result) => {
                     unmount(activeModal);
                     isModalOpen = false;
                     activeModal = null;
                     resolve(result);
                  },
               },
            });
         });

         if (options) {
            await actor.AttributeRoll(options.dice, options.attributeName, options.options);
         }
      } else {
         await actor.AttributeRoll($valueStore, key);
      }

      e.preventDefault();
   }
</script>

<svelte:window on:keydown|capture={handleEscape} />

{#if $isShoppingState}
   <div class="stat-card" role="button" tabindex="0">
      <h4 class="no-margin uppercase">{localize(localization[key])}</h4>
      <div class="stat-card-background"></div>

      <div class="stat-label">
         {#if key !== "reaction"}
            <i
               class="fa-solid fa-circle-chevron-down decrement-attribute {isMinLimit ? 'disabled' : ''}"
               role="button"
               tabindex="0"
               onclick={decrement}
               onkeydown={(e) => (e.key === "ArrowDown" || e.key === "s") && decrement()}
            ></i>
         {/if}

         <h1 class="stat-value">{$valueStore}</h1>
         {#if key !== "reaction"}
            <i
               class="fa-solid fa-circle-chevron-up increment-attribute {$attributePointStore === 0 ? 'disabled' : ''}"
               role="button"
               tabindex="0"
               onclick={increment}
               onkeydown={(e) => (e.key === "ArrowUp" || e.key === "w") && increment()}
            ></i>
         {/if}
      </div>
   </div>
{:else}
   <div
      class="stat-card button"
      role="button"
      tabindex="0"
      onclick={Roll}
      onkeydown={(e) => {
         if (e.key === "Enter" || e.key === " ") Roll(e);
      }}
   >
      <h4 class="no-margin uppercase">{localize(localization[key])}</h4>
      <div class="stat-card-background"></div>

      <div class="stat-label">
         <h1 class="stat-value">{$valueStore}</h1>
      </div>
   </div>
{/if}
