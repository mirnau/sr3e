<script>
   import { localize } from "../../../../services/utilities.js";
   import { flags } from "../../../../services/commonConsts.js";
   import { StoreManager, stores } from "../../../svelteHelpers/StoreManager.svelte.js";
   import { onDestroy } from "svelte";
   import { mount, unmount } from "svelte";
   import RollComposerComponent from "../../components/RollComposerComponent.svelte";

   let { actor, stat, localization, key } = $props();

   const storeManager = StoreManager.Subscribe(actor);

   // Use GetSumROStore for total, and get value store for direct updates
   let total = storeManager.GetSumROStore(`attributes.${key}`);
   let valueStore = storeManager.GetRWStore(`attributes.${key}.value`);
   let attributePointStore = storeManager.GetRWStore("creation.attributePoints");

   let isShoppingState = storeManager.GetFlagStore(flags.actor.isShoppingState);
   let attributeAssignmentLockedStore = storeManager.GetFlagStore(flags.actor.attributeAssignmentLocked);

   let metatype = $derived(actor.items.find((i) => i.type === "metatype") || []);

   let attributeLimit = $derived(key === "magic" ? null : (metatype.system.attributeLimits[key] ?? 0));

   let isMinLimit = $derived($total.value <= 1);
   // Removed isMaxLimit

   let activeModal = null;
   let isModalOpen = storeManager.GetShallowStore(actor.id, stores.isrollcomposeropen, false);

   function add(change) {
      if (!$attributeAssignmentLockedStore) {
         const newPoints = $attributePointStore - change;
         if (newPoints < 0) return;

         valueStore.update(v => v + change);
         $attributePointStore = newPoints;
      }
   }

   const increment = () => {
      // Removed isMaxLimit check
      add(1);
   };

   const decrement = () => {
      if (!isMinLimit) add(-1);
   };

   function handleEscape(e) {
      if (e.key === "Escape" && activeModal) {
         e.preventDefault();
         e.stopImmediatePropagation();
         e.stopPropagation();
         unmount(activeModal);
         $isModalOpen = false;
         activeModal = null;
      }
   }

   onDestroy(() => {
      StoreManager.Unsubscribe(actor);
      if (activeModal) {
         unmount(activeModal);
         $isModalOpen = false;
         activeModal = null;
      }
   });

   async function Roll(e) {
      if (e.shiftKey) {
         if ($isModalOpen) return;
         $isModalOpen = true;

         const options = await new Promise((resolve) => {
            activeModal = mount(RollComposerComponent, {
               target: document.querySelector(".composer-position"),
               props: {
                  actor,
                  config: CONFIG.sr3e,
                  caller: { key, value: $total.value, type: "attribute", dice: $total.sum },
                  onclose: (result) => {
                     unmount(activeModal);
                     $isModalOpen = false;
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
         await actor.AttributeRoll($total.sum, key);
      }

      e.preventDefault();
   }
</script>

<svelte:window on:keydown|capture={handleEscape} />

{#if $isShoppingState}
   <div class="stat-card" class:button={!$isShoppingState} role="button" tabindex="0">
      <h4 class="no-margin uppercase">{localize(localization[key])}</h4>
      <div class="stat-card-background"></div>

      <div class="stat-label">
            <i
               class="fa-solid fa-circle-chevron-down decrement-attribute {isMinLimit ? 'disabled' : ''}"
               role="button"
               tabindex="0"
               onclick={decrement}
               onkeydown={(e) => (e.key === "ArrowDown" || e.key === "s") && decrement()}
            ></i>

         <h1 class="stat-value">{$total.sum}</h1>
            <i
               class="fa-solid fa-circle-chevron-up increment-attribute {$attributePointStore === 0
                  ? 'disabled'
                  : ''}"
               role="button"
               tabindex="0"
               onclick={increment}
               onkeydown={(e) => (e.key === "ArrowUp" || e.key === "w") && increment()}
            ></i>
      </div>
   </div>
{:else}
   <div
      class="stat-card"
      class:button={!$isShoppingState}
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
         <h1 class="stat-value">{$total.sum}</h1>
      </div>
   </div>
{/if}
