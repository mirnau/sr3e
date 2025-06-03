<script>
    import AttributeCard from "./AttributeCardKarmaState.svelte";
    import { localize } from "../../../svelteHelpers.js";
    import { setupMasonry } from "../../../foundry/masonry/responsiveMasonry.js";
    import { shoppingState } from "../../../svelteStore.js";
    import CardToolbar from "./CardToolbar.svelte";

    let { actor = {}, config = {}, id = {}, span = {} } = $props();
    let movement = $state(actor.system.movement);
    let localization = config.movement;
    let gridContainer;

    const isShoppingState = false;

    $effect(() => {
        const result = setupMasonry({
            container: gridContainer,
            itemSelector: ".stat-card",
            gridSizerSelector: ".attribute-grid-sizer",
            gutterSizerSelector: ".attribute-gutter-sizer",
            minItemWidth: 180,
        });
        return result.cleanup;
    });
</script>

<CardToolbar {id} />
<h1>{localize(config.movement.movement)}</h1>
<div bind:this={gridContainer} class="attribute-masonry-grid">
    <div class="attribute-grid-sizer"></div>
    <div class="attribute-gutter-sizer"></div>
    {#each Object.entries(movement) as [key, stat]}
            <AttributeCard {actor} {stat} {localization} {key} {isShoppingState}/>
    {/each}
</div>