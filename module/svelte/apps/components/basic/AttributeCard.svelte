<script>
   import { localize } from "../../../../services/utilities.js";
   import { flags } from "../../../../services/commonConsts.js";
   import { StoreManager } from "../../../svelteHelpers/StoreManager.svelte.js";
   import { onDestroy } from "svelte";
   import { mount, unmount } from "svelte";
   import RollComposerComponent from "../../components/RollComposerComponent.svelte";

   let { actor, stat, localization, key } = $props();

   const storeManager = StoreManager.Subscribe(actor);

   let total = storeManager.GetCompositeStore(`attributes.${key}`, ["value", "mod", "meta"]);
   let value = storeManager.GetStore(`attributes.${key}.value`);
   let attributePointStore = storeManager.GetStore("creation.attributePoints");

   let isShoppingState = storeManager.GetFlagStore(flags.actor.isShoppingState);
   let attributeAssignmentLockedStore = storeManager.GetFlagStore(flags.actor.attributeAssignmentLocked);

   let metatype = $derived("meta" in stat && actor?.items ? actor.items.find((i) => i.type === "metatype") : null);

   let attributeLimit = $derived(
      key === "magic" || !("meta" in stat) ? null : (metatype?.system?.attributeLimits?.[key] ?? 0)
   );

   let isMinLimit = $derived($value <= 1);
   let isMaxLimit = $derived(attributeLimit ? $total.sum >= attributeLimit : false);

   let activeModal = null;

   function add(change) {
      if (!$attributeAssignmentLockedStore) {
         const newPoints = $attributePointStore - change;
         if (newPoints < 0) return;

         $value += change;
         $attributePointStore = newPoints;
      }
   }

   const increment = () => {
      if (!isMaxLimit) add(1);
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
      if (e.shiftKey) {
         const options = await new Promise((resolve) => {
            activeModal = mount(RollComposerComponent, {
               target: document.body,
               props: {
                  actor,
                  caller: key,
                  type: "attribute",
                  dice: $total.sum,
                  config: CONFIG.sr3e,
                  onclose: (result) => {
                     unmount(activeModal);
                     activeModal = null;
                     resolve(result);
                  },
               },
            });
         });

         if (options) {
            await actor.AttributeRoll($total.sum, key, options);
         }
      } else {
         await actor.AttributeRoll($total.sum, key);
      }

      e.preventDefault();
   }
</script>

<svelte:window on:keydown|capture={handleEscape} />

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
   {#if $isShoppingState}
      <i
         class="fa-solid fa-pen-to-square edit-icon"
         role="button"
         tabindex="0"
         onclick={() => (attributeAssignmentLockedStore = !$attributeAssignmentLockedStore)}
         onkeydown={(e) =>
            (e.key === "Enter" || e.key === " ") && (attributeAssignmentLockedStore = !$attributeAssignmentLockedStore)}
      ></i>
   {/if}
   <h4 class="no-margin uppercase">{localize(localization[key])}</h4>
   <div class="stat-card-background"></div>

   <div class="stat-label">
      {#if $isShoppingState && "meta" in stat}
         <i
            class="fa-solid fa-circle-chevron-down decrement-attribute {isMinLimit ? 'disabled' : ''}"
            role="button"
            tabindex="0"
            onclick={decrement}
            onkeydown={(e) => (e.key === "ArrowDown" || e.key === "s") && decrement()}
         ></i>
      {/if}

      <h1 class="stat-value">{$total.sum}</h1>

      {#if $isShoppingState && "meta" in stat}
         <i
            class="fa-solid fa-circle-chevron-up increment-attribute {isMaxLimit || $attributePointStore === 0
               ? 'disabled'
               : ''}"
            role="button"
            tabindex="0"
            onclick={increment}
            onkeydown={(e) => (e.key === "ArrowUp" || e.key === "w") && increment()}
         ></i>
      {/if}
   </div>
</div>
