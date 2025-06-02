<script>
    import { localize } from "../../../svelteHelpers.js";
    import { flags } from "../../../foundry/services/commonConsts.js";
    import { getActorStore, stores } from "../../stores/actorStores.js";

    let { actor = {}, config = {} } = $props();
    let system = $state(actor.system);

    // Store retrieval with lazy init
    let intelligenceStore = getActorStore(
        actor.id,
        stores.intelligence,
        system.attributes.intelligence.value +
            system.attributes.intelligence.mod +
            system.attributes.intelligence.meta ?? 0,
    );

    let attributePointStore = getActorStore(
        actor.id,
        stores.attributePoints,
        system.creation.attributePoints,
    );
    let skillPointStore = getActorStore(
        actor.id,
        stores.activePoints,
        system.creation.activePoints,
    );
    let knowledgePointStore = getActorStore(
        actor.id,
        stores.knowledgePoints,
        500,
    );
    let languagePointStore = getActorStore(
        actor.id,
        stores.languagePoints,
        500,
    );

    let isCharacterCreation = $state(true);

    // Reactive intelligence value
    let intelligence = $state(0);

    // This is a one-time set (read-only from here)
    // Note: You need to define attributeAssignmentLocked somewhere
    // attributeAssignmentLocked.set(
    //     actor.getFlag(flags.sr3e, flags.actor.attributeAssignmentLocked) ?? false,
    // );

    let attributePointsText = localize(config.attributes.attributes);
    let activePointsText = localize(config.skill.active);
    let knowledgePointsText = localize(config.skill.knowledge);
    let languagePointsText = localize(config.skill.language);

    // Make pointList reactive by using derived stores
    let pointList = $derived([
        { value: $attributePointStore, text: attributePointsText },
        { value: $skillPointStore, text: activePointsText },
        { value: $knowledgePointStore, text: knowledgePointsText },
        { value: $languagePointStore, text: languagePointsText },
    ]);

    // Subscribe to intelligence changes
    $effect(() => {
        const unsubscribe = intelligenceStore.subscribe((v) => {
            if (typeof v === "number") {
                intelligence = v;
            }
        });
        return unsubscribe;
    });

    // Update dependent values when intelligence changes
    $effect(() => {
        console.log("Recalculating stuff ...", intelligence);
        knowledgePointStore.set(intelligence * 5);
        languagePointStore.set(Math.floor(intelligence * 1.5));
    });

    // Handle character creation flag
    $effect(() => {
        if (!isCharacterCreation) {
            actor.setFlag(flags.sr3e, flags.actor.isCharacterCreation, false);
        }
    });
</script>

{#each pointList as point, i}
    <div class="point-container" style="top: {i * 8}rem">
        <h1>{point.value}</h1>
        <div>{point.text}</div>
    </div>
{/each}
