<script>
    import AttributeCard from "./AttributeCard.svelte";
    import { localize } from "../../../svelteHelpers.js";
    import { setupMasonry } from "../../../foundry/masonry/responsiveMasonry.js";
    import { shoppingState } from "../../../svelteStore.js";
    import CardToolbar from "./CardToolbar.svelte";

    let { actor = {}, config = {}, id = {}, span = {} } = $props();
    let movement = $state(actor.system.movement);
    let gridContainer;
    const isShoppingState = false;

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
<h1>{localize(config.movement.movement)}</h1>
<div bind:this={gridContainer} class="attribute-masonry-grid">
    <div class="attribute-grid-sizer"></div>
    <div class="attribute-gutter-sizer"></div>
    {#each Object.entries(movement) as [key, stat]}
        <div class="stat-card">
            <AttributeCard {stat} {config} {key} {isShoppingState}/>
        </div>
    {/each}
</div>