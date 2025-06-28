<script>
   import { localize } from "../../../../services/utilities.js";
   import { flags } from "../../../../services/commonConsts.js";
   import { StoreManager } from "../../../svelteHelpers/StoreManager.svelte.js";
   import { onDestroy } from "svelte";

   let { actor, stat, localization, key } = $props();

   const storeManager = StoreManager.Subscribe(actor);

   let total = storeManager.GetCompositeStore(`attributes.${key}`, ["value", "mod", "meta"]);
   let value = storeManager.GetStore(`attributes.${key}.value`);
   let attributePointStore = storeManager.GetStore("creation.attributePoints");

   let isShoppingState = storeManager.GetFlagStore(flags.actor.isShoppingState);

   let attributeAssignmentLocked = storeManger.getActorStore(flags.actor.attributeAssignmentLocked);

   let metatype = $derived("meta" in stat && actor?.items ? actor.items.find((i) => i.type === "metatype") : null);

   let attributeLimit = $derived(
      key === "magic" || !("meta" in stat) ? null : (metatype?.system?.attributeLimits?.[key] ?? 0)
   );

   let isMinLimit = $derived($value <= 1);
   let isMaxLimit = $derived(attributeLimit ? $total.sum >= attributeLimit : false);

   function add(change) {
      if (!$attributeAssignmentLocked) {
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

   onDestroy(() => {
      StoreManager.Unsubscribe(actor);
   });
</script>

<div class="stat-card">
   <h4 class="no-margin uppercase">{localize(localization[key])}</h4>
   <div class="stat-card-background"></div>

   <div class="stat-label">
      {#if $isShoppingState}
         {#if "meta" in stat}
            <i
               class="fa-solid fa-circle-chevron-down decrement-attribute {isMinLimit ? 'disabled' : ''}"
               role="button"
               tabindex="0"
               onclick={decrement}
               onkeydown={(e) => (e.key === "ArrowDown" || e.key === "s") && decrement()}
            ></i>
         {/if}
      {/if}

      <h1 class="stat-value">{$total.sum}</h1>
      {#if $isShoppingState}
         {#if "meta" in stat}
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
      {/if}
   </div>
</div>
