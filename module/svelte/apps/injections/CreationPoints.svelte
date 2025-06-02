<script>
    import { localize } from "../../../svelteHelpers.js";
    import { flags } from "../../../foundry/services/commonConsts.js";
    import {
        attributePointStore,
        skillPointStore,
        knowledgePointStore,
        languagePointStore,
        attributeAssignmentLocked,
    } from "../../../svelteStore.js";

    let { actor = {}, config = {} } = $props();

    let system = $state(actor.system);
    $attributePointStore = system.creation.attributePoints;
    $skillPointStore = system.creation.activePoints;

    // Make intelligence reactive by using $derived instead of $state
    let intelligence = $state(
        system.attributes.intelligence.value +
            system.attributes.intelligence.mod +
            (system.attributes.intelligence.meta ?? 0),
    );


    console.log("INTELLIGENCE", intelligence);

    let isCharacterCreation = $state(true);

    // This is a one-time set (read-only from here)
    attributeAssignmentLocked.set(
        actor.getFlag(flags.sr3e, flags.actor.attributeAssignmentLocked) ??
            false,
    );

    let attributePointsText = localize(config.attributes.attributes);
    let activePointsText = localize(config.skill.active);
    let knowledgePointsText = localize(config.skill.knowledge);
    let languagePointsText = localize(config.skill.language);

    let pointList = $state([
        { value: $attributePointStore, text: attributePointsText },
        { value: $skillPointStore, text: activePointsText },
        { value: $knowledgePointStore, text: knowledgePointsText },
        { value: $languagePointStore, text: languagePointsText },
    ]);

    // Update the effect to use the reactive intelligence value
    $effect(() => {
        console.log("Recalculating stuff ...", intelligence);
        $knowledgePointStore = intelligence * 5;
        $languagePointStore = Math.floor(intelligence * 1.5);
    });

    $effect(() => {
        if (!isCharacterCreation)
            actor.setFlag(flags.sr3e, flags.actor.isCharacterCreation, false);
    });
</script>

{#each pointList as point, i}
    <div class="point-container" style="top: {i * 8}rem">
        <h1>{point.value}</h1>
        <div>{point.text}</div>
    </div>
{/each}
