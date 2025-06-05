<script>
    import ActiveSkillCard from "./ActiveSkillCard.svelte";
    import { setupMasonry } from "../../../../foundry/masonry/responsiveMasonry.js";
    let gridContainer;

    let { actor = {}, config = {} } = $props();

    const activeSkills = actor.items?.filter(
        (item) => item.type === "skill" && item.system.skillType === "active",
    );

    $effect(() => {
        const result = setupMasonry({
            container: gridContainer,
            itemSelector: ".skill-card",
            gridSizerSelector: ".skill-grid-sizer",
            gutterSizerSelector: ".skill-gutter-sizer",
            minItemWidth: 120,
        });
        return result.cleanup;
    });
</script>

<div bind:this={gridContainer} class="skill-masonry-grid">
    <div class="skill-grid-sizer"></div>
    <div class="skill-gutter-sizer"></div>
    {#each activeSkills as skill}
        <ActiveSkillCard {skill} {config} />
    {/each}
</div>
