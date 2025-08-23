<script>
   import { localize } from "@services/utilities.js";
   import { flags } from "@services/commonConsts.js";
   import { StoreManager, stores } from "@sveltehelpers/StoreManager.svelte.js";
   import { onDestroy } from "svelte";
   import { mount, unmount } from "svelte";
   import RollComposerComponent from "@sveltecomponent/RollComposerComponent.svelte";
   import SR3ERoll from "@documents/SR3ERoll.js";
   import ProcedureLock from "@services/procedure/FSM/ProcedureLock.js";
   import ProcedureFactory from "@services/procedure/FSM/ProcedureFactory.js";
   import UncontestedAttributeProcedure from "@services/procedure/FSM/UncontestedAttributeProcedure.js";

   let { actor, localization, key } = $props();

   const storeManager = StoreManager.Subscribe(actor);

   let valueROStore = storeManager.GetSumROStore(`attributes.${key}`);
   let baseValueStore = storeManager.GetRWStore(`attributes.${key}.value`);
   let attributePointStore = storeManager.GetRWStore("creation.attributePoints");

   let isShoppingState = storeManager.GetFlagStore(flags.actor.isShoppingState);
   let attributeAssignmentLockedStore = storeManager.GetFlagStore(flags.actor.attributeAssignmentLocked);

   let metatype = $derived(actor.items.find((i) => i.type === "metatype") || []);
   let attributeLimit = $derived(key === "magic" ? null : (metatype.system.attributeLimits[key] ?? 0));

   let committedValue = null;

   $effect(() => {
      if ($isShoppingState && $attributeAssignmentLockedStore && committedValue === null) {
         committedValue = $valueROStore.value;
      }
   });

   let isMinLimit = $state(false);

   $effect(() => {
      if ($isShoppingState && $attributeAssignmentLockedStore && committedValue !== null) {
         isMinLimit = $valueROStore.value <= committedValue;
      } else {
         isMinLimit = $valueROStore.value <= 1;
      }
   });

   let currentDicePoolSelectionStore = storeManager.GetShallowStore(actor.id, stores.dicepoolSelection);

   let valueRWStore = $derived($isShoppingState && !$attributeAssignmentLockedStore ? baseValueStore : null);

   $effect(() => {
      if (
         !$attributeAssignmentLockedStore &&
         $isShoppingState &&
         $valueROStore.value + $valueROStore.mod < 1 &&
         $valueROStore.mod < 0 &&
         valueRWStore
      ) {
         let deficit = 1 - ($valueROStore.value + $valueROStore.mod);
         while (deficit > 0 && $attributePointStore > 0) {
            $attributePointStore -= 1;
            $valueRWStore += 1;
            deficit -= 1;
         }
      }
   });

   let activeModal = null;

   function add(change) {
      if (!$attributeAssignmentLockedStore && $isShoppingState && valueRWStore) {
         const newPoints = $attributePointStore - change;
         const newValue = $valueRWStore + change;

         if (newPoints >= 0 && (attributeLimit === null || newValue <= attributeLimit)) {
            $attributePointStore = newPoints;
            $valueRWStore = newValue;
         }
      }
   }

   const increment = () => add(1);
   const decrement = () => {
      if (!isMinLimit) add(-1);
   };

   function handleEscape(e) {
      if (e.key === "Escape" && activeModal) {
         e.preventDefault();
         e.stopImmediatePropagation();
         e.stopPropagation();
         unmount(activeModal);
         activeModal = null;
      }
   }

   onDestroy(() => {
      StoreManager.Unsubscribe(actor);
      if (activeModal) {
         unmount(activeModal);
         activeModal = null;
      }
   });

   async function Roll(e) {
      const proc = ProcedureFactory.Create(ProcedureFactory.type.attribute, {
         actor,
         args: {
            attributeKey: key,
            title: localize(localization[key]),
         },
      });

      DEBUG && !proc && LOG.error("Could not create attribute procedure.", [__FILE__, __LINE__]);

      if (e.shiftKey) {
         actor.sheet.displayRollComposer(proc);
      } else {
         console.log("FLUFFY CAT");
         await proc.execute();
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

         <h1 class="stat-value">{$valueROStore.sum}</h1>
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
         <h1 class="stat-value">{$valueROStore.sum}</h1>
      </div>
   </div>
{/if}
