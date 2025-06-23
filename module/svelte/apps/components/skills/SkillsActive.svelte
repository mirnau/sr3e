<script>
    import SkillCategory from "./SkillCategory.svelte";
    import MasonryGrid from "../basic/MasonryGrid.svelte";
    import { setupMasonry } from "../../../../foundry/masonry/responsiveMasonry.js";
    import { masonryMinWidthFallbackValue } from "../../../../services/commonConsts.js";
    import { getActorStore, stores } from "../../../stores/actorStores.js";
    import { tick } from "svelte";

    let { actor = {}, config = {} } = $props();

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

</script>

<MasonryGrid itemSelector="skill-category-container" gridPrefix="skill-container">
    {#each attributeSortedSkills as category}
        <SkillCategory {...category} {actor} {config} />
    {/each}
</MasonryGrid>