<script lang="ts">
    import ActiveSkillCard from "./ActiveSkillCard.svelte";
    import KnowledgeSkillCard from "./KnowledgeSkillCard.svelte";
    import LanguageSkillCard from "./LanguageSkillCard.svelte";
    import { localize } from "@services/utilities.js";
    import { setupMasonry } from "../../../../foundry/masonry/responsiveMasonry.js";
    import { masonryMinWidthFallbackValue } from "@services/commonConsts.js";

    let {
        attribute,
        skills: categoryOfSkills = [],
        actor = {},
        config = {},
    } = $props();
    
    let gridContainer;

    $effect(() => {
        const rem = parseFloat(
            getComputedStyle(document.documentElement).fontSize,
        );

        const result = setupMasonry({
            container: gridContainer,
            itemSelector: ".skill-card-container",
            gridSizerSelector: ".skill-grid-sizer",
            gutterSizerSelector: ".skill-gutter-sizer",
            minItemWidth: masonryMinWidthFallbackValue.skillGrid * rem,
        });

        return result.cleanup;
    });
</script>

<div class="skill-category-container static-full-width">
    <div class="skill-masonry-background-layer"></div>
    <div class="skill-container-header">
        <h1>{localize(config.attributes[attribute])}</h1>
    </div>
    <div bind:this={gridContainer} class="skill-masonry-grid">
        <div class="skill-grid-sizer"></div>
        <div class="skill-gutter-sizer"></div>
        {#each categoryOfSkills as skill (skill._id)}
            {#if skill.system.skillType === "active"}
                <ActiveSkillCard {skill} {actor} {config} />
            {:else if skill.system.skillType === "knowledge"}
                <KnowledgeSkillCard {skill} {actor} {config} />
            {:else if skill.system.skillType === "language"}
                <LanguageSkillCard {skill} {actor} {config} />
            {/if}
        {/each}
    </div>
</div>
