<script>
    import SkillCategory from "./SkillCategory.svelte";
    import { setupMasonry } from "../../../../foundry/masonry/responsiveMasonry.js";
    import { masonryMinWidthFallbackValue } from "../../../../services/commonConsts.js";
    import { getActorStore, stores } from "../../../stores/actorStores.js";

    let { actor = {}, config = {} } = $props();
    let gridContainer;

    const languageSkillsIdArrayStore = getActorStore(
        actor.id,
        stores.languageSkillsIds,
        actor.items
            .filter(
                (item) =>
                    item.type === "skill" &&
                    item.system.skillType === "language",
            )
            .map((item) => item.id),
    );

    let languageSkills = $derived(
        actor.items.filter((item) =>
            $languageSkillsIdArrayStore.includes(item.id),
        ),
    );
</script>

<div bind:this={gridContainer} class="skill-container-masonry-grid">
    <SkillCategory
        attribute="intelligence"
        skills={languageSkills}
        {actor}
        {config}
    />
</div>
