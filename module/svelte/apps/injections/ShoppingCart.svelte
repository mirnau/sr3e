<script>
	import { flags } from "../../../foundry/services/commonConsts.js";
	import { localize } from "../../../svelteHelpers.js";
	import { shoppingState } from "../../../svelteStore.js";
	import { getActorStore, stores } from "../../stores/actorStores.js";

	let { actor = {}, config = {} } = $props();

	let isShoppingState = getActorStore(
		actor.id,
		stores.isShoppingState,
		actor.getFlag(flags.sr3e, flags.actor.isShoppingState),
	);

	function toggleShoppingState() {
		$isShoppingState = !$isShoppingState;
		actor.setFlag(flags.sr3e, flags.actor.isShoppingState, isShoppingState);
		console.log("shoppingState", $isShoppingState);
	}
</script>

<div>
	<button
		type="button"
		aria-label={localize(config.sheet.buyupgrades)}
		class={`header-control icon fa-solid fa-cart-shopping ${$isShoppingState ? "pulsing-green-cart" : ""}`}
		onclick={toggleShoppingState}
	></button>
</div>
