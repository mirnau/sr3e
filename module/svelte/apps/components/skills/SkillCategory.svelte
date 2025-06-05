<script>
    import ActiveSkillCard from "./ActiveSkillCard.svelte";
    import { localize } from "../../../../svelteHelpers.js";
    import { setupMasonry } from "../../../../foundry/masonry/responsiveMasonry.js";
    import { masonryMinWidthFallbackValue } from "../../../../foundry/services/commonConsts.js";

    let { attribute, skills = [], config = {} } = $props();
    let gridContainer;

    $effect(() => {
        const rem = parseFloat(
            getComputedStyle(document.documentElement).fontSize,
        );

        const result = setupMasonry({
            container: gridContainer,
            itemSelector: ".skill-card",
            gridSizerSelector: ".skill-grid-sizer",
            gutterSizerSelector: ".skill-gutter-sizer",
            minItemWidth: masonryMinWidthFallbackValue.skillGrid * rem,
        });

        return result.cleanup;
    });
</script>

<div class="skill-category-container">
    <div class="skill-masonry-background-layer"></div>
    <div class="skill-container-header">
        <h1>{localize(config.attributes[attribute])}</h1>
    </div>
    <div bind:this={gridContainer} class="skill-masonry-grid">
        <div class="skill-grid-sizer"></div>
        <div class="skill-gutter-sizer"></div>

        {#each skills as skill}
            <ActiveSkillCard {skill} {config} />
        {/each}
    </div>
</div>