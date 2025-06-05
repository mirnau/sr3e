<script>
    import SkillCategory from "./SkillCategory.svelte";
    import { setupMasonry } from "../../../../foundry/masonry/responsiveMasonry.js";
    import { masonryMinWidthFallbackValue } from "../../../../foundry/services/commonConsts.js";

    let { actor = {}, config = {} } = $props();
    let gridContainer;

    const activeSkills = actor.items?.filter(
        (item) => item.type === "skill" && item.system.skillType === "active",
    );

    let attributeSortedSkills = $derived(
        [
            "body",
            "quickness",
            "strength",
            "charisma",
            "intelligence",
            "willpower",
        ].map((attribute) => ({
            attribute,
            skills: activeSkills.filter(
                (skill) =>
                    skill.system.activeSkill.linkedAttribute === attribute,
            ),
        })),
    );

    $effect(() => {
        const rem = parseFloat(
            getComputedStyle(document.documentElement).fontSize,
        );

        const result = setupMasonry({
            container: gridContainer,
            itemSelector: ".skill-category-container",
            gridSizerSelector: ".skill-container-grid-sizer",
            gutterSizerSelector: ".skill-container-gutter-sizer",
            minItemWidth: masonryMinWidthFallbackValue.skillCategoryGrid * rem,
        });
        return result.cleanup;
    });
</script>

<div bind:this={gridContainer} class="skill-container-masonry-grid">
    <div class="skill-container-grid-sizer"></div>
    <div class="skill-container-gutter-sizer"></div>
    {#each attributeSortedSkills as category}
        <SkillCategory {...category} {config} />
    {/each}
</div>
