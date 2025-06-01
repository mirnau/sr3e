<script>
    import { localize } from "../../../svelteHelpers.js";
    import { flags } from "../../../foundry/services/commonConsts.js";

    let { actor = {}, config = {} } = $props();

    let creation = $state(actor.system.creation);
    let attributePoints = $state(creation.attributePoints);
    let skillPoints = $state(creation.activePoints);
    let intelligence = $state(actor.system.attributes.intelligence.total);
    let knowledgePoints = $derived(intelligence * 5);
    let languagePoints = $derived(Math.floor(intelligence * 1.5));
    let isCharacterCreation = $state(true);
    let attributePointsText = localize(config.attributes.attributes);
    let activePointsText = localize(config.skill.active);
    let knowledgePointsText = localize(config.skill.knowledge);
    let languagePointsText = localize(config.skill.language);


    let pointList = $derived([ 
        {value: attributePoints, text: attributePointsText},
        {value: skillPoints, text: activePointsText},
        {value: knowledgePoints, text: knowledgePointsText},
        {value: languagePoints, text: languagePointsText},
    ]);

    let remainingPoints = $derived(
        skillPoints + knowledgePoints + languagePoints,
    );

    $effect(() => {
        if (!isCharacterCreation)
            actor.setFlag(flags.sr3e, flags.actor.isCharacterCreation, false);
    });

    $effect(() => {
        actor.update({ "system.creation": creation }, { render: false });
    });

    $effect(() => {
        if (remainingPoints < 1) {
            //Promt are you done Yes or No
        }
    });
</script>

{#each pointList as point, i}
    <div class="point-container" style="top: {i * 8}rem">
        <h1>{point.value}</h1>
        <div>{point.text}</div>
    </div>
{/each}
