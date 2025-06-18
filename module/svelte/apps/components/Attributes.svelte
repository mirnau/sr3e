<script>
    import AttributeCardCreationState from "./basic/AttributeCardCreationState.svelte";
    import AttributeCardKarmaState from "./basic/AttributeCardKarmaState.svelte";
    import { localize } from "../../../svelteHelpers.js";
    import { setupMasonry } from "../../../foundry/masonry/responsiveMasonry.js";
    import CardToolbar from "./CardToolbar.svelte";
    import { getActorStore, stores } from "../../stores/actorStores.js";
    import { flags, masonryMinWidthFallbackValue } from "../../../foundry/services/commonConsts.js";

    let { actor = {}, config = {}, id = {}, span = {} } = $props();
    let attributes = $state(actor.system.attributes);
    let gridContainer;
    let localization = config.attributes;

    let attributeAssignmentLocked = getActorStore(
        actor.id,
        stores.attributeAssignmentLocked,
        actor.getFlag(flags.sr3e, flags.attributeAssignmentLocked),
    );

    $effect(() => {
        const rem = parseFloat(
            getComputedStyle(document.documentElement).fontSize,
        );
        const result = setupMasonry({
            container: gridContainer,
            itemSelector: ".stat-card",
            gridSizerSelector: ".attribute-grid-sizer",
            gutterSizerSelector: ".attribute-gutter-sizer",
            minItemWidth: masonryMinWidthFallbackValue.attributeGrid * rem,
        });
        return result.cleanup;
    });
</script>

<CardToolbar {id} />
<h1>{localize(config.attributes.attributes)}</h1>
<div bind:this={gridContainer} class="attribute-masonry-grid">
    <div class="attribute-grid-sizer"></div>
    <div class="attribute-gutter-sizer"></div>
    {#each Object.entries(attributes) as [key, stat]}
        {#if !$attributeAssignmentLocked}
            <AttributeCardCreationState {actor} {stat} {localization} {key} />
        {:else}
            <AttributeCardKarmaState {actor} {stat} {localization} {key} />
        {/if}
    {/each}
</div>
