<script>
    import AttributeCard from "./AttributeCard.svelte";
    import { localize } from "../../../foundry/SvelteHelpers.js";
    import { setupMasonry } from '../../../foundry/masonry/responsiveMasonry.js';

    let { actor = {}, config = {} } = $props();

    let attributes = $state(actor.system.attributes);

    let gridContainer;

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

<h1>{localize(config.attributes.attributes)}</h1>
<div bind:this={gridContainer} class="attribute-masonry-grid ">
    <div class="attribute-grid-sizer"></div>
    <div class="attribute-gutter-sizer"></div>
    {#each Object.entries(attributes) as [key, stat]}
        <div class="stat-card" class:stat-card={key} class:attribute-card={key}>
            <AttributeCard statKey={key} {stat} {config} />
        </div>
    {/each}
</div>
