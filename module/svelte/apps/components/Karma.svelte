<script>
    import AttributeCard from "./AttributeCard.svelte";
    import { localize } from "../../../svelteHelpers.js";
    import { setupMasonry } from "../../../foundry/masonry/responsiveMasonry.js";
    import { shoppingState } from "../../../svelteStore.js";
    import CardToolbar from "./CardToolbar.svelte";

    let { actor = {}, config = {}, id = {}, span = {} } = $props();
    let karma = $state(actor.system.karma);
    let essence = $state(actor.system.attributes.essence ?? 0);
    let gridContainer;
    let survivor = $derived(karma.miraculousSurvival);

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
<h1>{localize(config.karma.karma)}</h1>
<div bind:this={gridContainer} class="attribute-masonry-grid">
    <div class="attribute-grid-sizer"></div>
    <div class="attribute-gutter-sizer"></div>

    <div class="stat-card">
        <h4 class="no-margin">{localize(config.karma.goodKarma)}</h4>
        <h1 class="stat-value">
            {karma.goodKarma}
        </h1>
    </div>

    <div class="stat-card">
        <h4 class="no-margin">{localize(config.karma.lifetimeKarma)}</h4>
        <h1 class="stat-value">
            {karma.karmaPool}
        </h1>
    </div>

    <div class="stat-card">
        <h4 class="no-margin">{localize(config.karma.lifetimeKarma)}</h4>
        <h1 class="stat-value">
            {karma.lifetimeKarma}
        </h1>
    </div>

    <div class="stat-card">
        <h4 class="no-margin">{localize(config.attributes.essence)}</h4>
        <h1 class="stat-value">
            {essence}
        </h1>
    </div>

    {#if !survivor}
        <div class="stat-card">
            <h4 class="no-margin">
                {localize(config.karma.miraculousSurvival)}
            </h4>
            <h5 class="stat-value">
                <i class="fa-solid fa-heart-circle-bolt"></i>
            </h5>
        </div>
    {:else}
        <!--display nothing-->
    {/if}
</div>
