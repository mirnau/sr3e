<script>
    import { localize } from "../../../svelteHelpers.js";
    import { setupMasonry } from "../../../foundry/masonry/responsiveMasonry.js";

    let { actor = {}, config = {}, id = {}, span = {} } = $props();
    let gridContainer;

    let attributes = $state(actor.system.attributes);

    let intelligenceBaseTotal = $derived(
        attributes.intelligence.value + attributes.intelligence.mod,
    );
    let intelligence = $derived(
        intelligenceBaseTotal + (attributes.intelligence.meta ?? 0),
    );

    let quicknessBaseTotal = $derived(
        attributes.quickness.value + attributes.quickness.mod,
    );
    let quickness = $derived(
        quicknessBaseTotal + (attributes.quickness.meta ?? 0),
    );

    let reaction = $derived(Math.floor(intelligence + quickness) * 0.5);
    let augmentedReaction = $derived(reaction);

    let initiativeDice = 1;

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

<div>
    <h1>{localize(config.initiative.initiative)}</h1>
    <div bind:this={gridContainer} class="attribute-masonry-grid">
        <div class="attribute-grid-sizer"></div>
        <div class="attribute-gutter-sizer"></div>
        <div class="stat-card">
            <h4 class="no-margin">{localize(config.initiative.initiativeDice)}</h4>
                <h1 class="stat-value">{initiativeDice}</h1>
        </div>
        <div class="stat-card">
            <h4 class="no-margin">{localize(config.initiative.reaction)}</h4>
            <h1 class="stat-value">{reaction}</h1>
        </div>
        <div class="stat-card">
            <h4 class="no-margin">{localize(config.initiative.augmentedReaction)}</h4>
            <h1 class="stat-value">{augmentedReaction}</h1>
        </div>
        
    </div>
</div>
