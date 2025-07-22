<script>
   import { StoreManager } from "../../../svelte/svelteHelpers/StoreManager.svelte.js";
   import { flags } from "@services/commonConsts.js";
   import { localize } from "@services/utilities.js";
   import { shoppingState } from "../../../svelteStore.js";
   import { onDestroy } from "svelte";

   let { actor = {}, config = {} } = $props();

   let storeManager = StoreManager.Subscribe(actor);
   let isShoppingState = storeManager.GetFlagStore(flags.actor.isShoppingState);

   onDestroy(() => {
      StoreManager.Unsubscribe(actor);
   });
</script>

<div>
   <button
      type="button"
      aria-label={localize(config.sheet.buyupgrades)}
      class={`header-control icon fa-solid fa-cart-shopping ${$isShoppingState ? "pulsing-green-cart" : ""}`}
      onclick={() => isShoppingState.update(v => !v)}
   ></button>
</div>
