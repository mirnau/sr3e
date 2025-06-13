<script>
    import SkillCategory from "./SkillCategory.svelte";
    import { setupMasonry } from "../../../../foundry/masonry/responsiveMasonry.js";
    import { masonryMinWidthFallbackValue } from "../../../../foundry/services/commonConsts.js";
    import { getActorStore, stores } from "../../../stores/actorStores.js";

    let { actor = {}, config = {} } = $props();
    let gridContainer;

    const knowledgeSkillsIdArrayStore = getActorStore(
        actor.id,
        stores.knowledgeSkillsIds,
        actor.items
            .filter(
                (item) =>
                    item.type === "skill" &&
                    item.system.skillType === "knowledge",
            )
            .map((item) => item.id),
    );

    let knowledgeSkills = $derived(
        actor.items.filter((item) =>
            $knowledgeSkillsIdArrayStore.includes(item.id),
        ),
    );
</script>

<div bind:this={gridContainer} class="skill-container-masonry-grid">
    <SkillCategory
        attribute="intelligence"
        skills={knowledgeSkills}
        {actor}
        {config}
    />
</div>
