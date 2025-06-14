<script>
    import { localize } from "../../../../svelteHelpers.js";
    import { flags } from "../../../../foundry/services/commonConsts.js";
    import { getActorStore, stores } from "../../../stores/actorStores.js";
    import CreationPointList from "../../components/CreationPointList.svelte";

    let { actor = {}, config = {} } = $props();

    let system = $state(actor.system);

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
        system.creation.knowledgePoints,
    );
    let languagePointStore = getActorStore(
        actor.id,
        stores.languagePoints,
        system.creation.languagePoints,
    );

    let isCharacterCreation = getActorStore(
        actor.id,
        stores.isCharacterCreation,
        actor.getFlag(flags.sr3e, flags.actor.isCharacterCreation),
    );

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

    $effect(() => {
        if (
            $skillPointStore === 0 &&
            $knowledgePointStore === 0 &&
            $languagePointStore === 0
        ) {
            (async () => {
                const confirmed =
                    await foundry.applications.api.DialogV2.confirm({
                        window: {
                            title: localize(config.modal.exitcreationmodetitle),
                        },
                        content:
                            localize(config.modal.exitcreationmode),
                        yes: {
                            label: localize(config.modal.confirm),
                            default: true,
                        },
                        no: {
                            label: localize(config.modal.decline),
                        },
                        modal: true,
                        rejectClose: true,
                    });

                if (confirmed) {
                    actor.setFlag(
                        flags.sr3e,
                        flags.actor.isCharacterCreation,
                        false,
                    );
                    $isCharacterCreation = false;
                }
            })();
        }
    });
</script>

<CreationPointList points={pointList} containerCSS={"skill-point-assignment"} />
