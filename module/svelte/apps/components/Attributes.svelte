<script>

    import AttributeCard from "./AttributeCard.svelte";
    import { localize } from "../../../svelteHelpers.js";
    import { setupMasonry } from "../../../foundry/masonry/responsiveMasonry.js";
    import { shoppingState } from "../../../svelteStore.js";
    import CardToolbar from "./CardToolbar.svelte";

    let { actor = {}, config = {}, id = {}, span = {} } = $props();
    let attributes = $state(actor.system.attributes);
    let gridContainer;
    let isShoppingState = $state(false);
    let localization = config.attributes;

    $effect(() => {
        const unsubscribe = shoppingState.subscribe(
            (v) => (isShoppingState = v),
        );
        return unsubscribe;
    });

    $effect(() => {
        const cleanup = setupMasonry({
            container: gridContainer,
            itemSelector: ".stat-card",
            gridSizerSelector: ".attribute-grid-sizer",
            gutterSizerSelector: ".attribute-gutter-sizer",
            minItemWidth: 180,
        });
        return cleanup;
    });

</script>

<CardToolbar {id} />
<h1>{localize(config.attributes.attributes)}</h1>
<div bind:this={gridContainer} class="attribute-masonry-grid">
    <div class="attribute-grid-sizer"></div>
    <div class="attribute-gutter-sizer"></div>
    {#each Object.entries(attributes) as [key, stat]}
        <AttributeCard {stat} {localization} {key} {isShoppingState} />
    {/each}
</div>
