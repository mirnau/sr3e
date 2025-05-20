<script>
	import { flags } from "../../../foundry/services/commonConsts.js";
	import { localize } from "../../../svelteHelpers.js";

	let { actor = {}, config = {} } = $props();

	let isShoppingState = $state(true);

	(async () => {
		const current = await actor.getFlag(
			flags.sr3e,
			flags.actor.isShoppingState,
		);
		isShoppingState = current ?? true;
		if (current === null)
			actor.setFlag(flags.sr3e, flags.actor.isShoppingState, true);
	})();

	function toggleShoppingState() {
		isShoppingState = !isShoppingState;
		actor.setFlag(flags.sr3e, flags.actor.isShoppingState, isShoppingState);
	}
</script>

<div>
	<button
		type="button"
		aria-label={localize(config.sheet.buyupgrades)}
		class={`header-control icon fa-solid fa-cart-shopping ${isShoppingState ? "pulsing-green-cart" : ""}`}
		onclick={toggleShoppingState}
	></button>
</div>
