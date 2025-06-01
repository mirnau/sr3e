<script>
    import { flags } from "../../../foundry/services/commonConsts.js";

    let { actor = {}, config = {} } = $props();

    let creation = actor.system.creation;
    let attributePoints = $state(creation.attributePoints);
    let skillPoints = $state(creation.attributePoints);
    let intelligence = $state(actor.system.attributes.intelligence);
    let knowledgePoints = $derived(intelligence * 5);
    let languagePoints = $derived(Math.floor(intelligence * 1.5));

    let remainingPoints =  $derived(skillPoints + knowledgePoints + languagePoints);



    let isCharacterCreation = state$(
        actor.getFlag(flags.sr3e, flags.actor.isCharacterCreation),
    );

    $effect(() => {
        if (!isCharacterCreation)
            actor.setFlag(flags.sr3e, flags.actor.isCharacterCreation, false);
    });

    $effect(() => {
        actor.Update({ "system.creation": creation }, { render: false });
    });

    $effect(() => {
        if(remainingPoints < 1 ) {
            //Promt are you done Yes or No
        }
    });

</script>

<div></div>
