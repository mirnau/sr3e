<script>
    let { actor = {} } = $props();

    let isShoppingState = $state(true);

    (async () => {
        const current = await actor.getFlag("sr3e", "isShoppingState");
        isShoppingState = current ?? true;
        if (current === null) actor.setFlag("sr3e", "isShoppingState", true);
    })();

    function toggleShoppingState() {
        isShoppingState = !isShoppingState;
        actor.setFlag("sr3e", "isShoppingState", isShoppingState);
    }
</script>

<div>
    <button
        type="button"
        aria-label="Buy upgrades"
        class={`header-control icon fa-solid fa-cart-shopping ${isShoppingState ? "pulsing-green-cart" : ""}`}
        onclick={toggleShoppingState}
    ></button>
</div>