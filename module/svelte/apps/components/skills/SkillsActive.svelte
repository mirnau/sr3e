<script>
    import SkillCategory from "./SkillCategory.svelte";
    import { setupMasonry } from "../../../../foundry/masonry/responsiveMasonry.js";
    import { masonryMinWidthFallbackValue } from "../../../../foundry/services/commonConsts.js";
    import { getActorStore, stores } from "../../../stores/actorStores.js";
    import { tick } from "svelte";

    let { actor = {}, config = {} } = $props();
    let gridContainer;
    let masonryInstance = null;

    const activeSkillsIdArrayStore = getActorStore(
        actor.id,
        stores.activeSkillsIds,
        actor.items
            .filter(
                (item) =>
                    item.type === "skill" && item.system.skillType === "active",
            )
            .map((item) => item.id),
    );

    let attributeSortedSkills = $derived(
        [
            "body",
            "quickness",
            "strength",
            "charisma",
            "intelligence",
            "willpower",
            "reaction",
        ].map((attribute) => ({
            attribute,
            skills: actor.items.filter(
                (item) =>
                    $activeSkillsIdArrayStore.includes(item.id) &&
                    item.system.activeSkill.linkedAttribute === attribute,
            ),
        })),
    );

    $effect(() => {
        if (masonryInstance) return;

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

        masonryInstance = result.masonryInstance;

        return result.cleanup;
    });


</script>

<div bind:this={gridContainer} class="skill-container-masonry-grid">
    <div class="skill-container-grid-sizer"></div>
    <div class="skill-container-gutter-sizer"></div>
    {#each attributeSortedSkills as category}
        <SkillCategory {...category} {actor} {config} />
    {/each}
</div>
