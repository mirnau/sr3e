<script>
    import { localize } from "../../../../svelteHelpers.js";
    import { flags } from "../../../../foundry/services/commonConsts.js";
    import { getActorStore, stores } from "../../../stores/actorStores.js";
    import CreationPointList from "../../components/CreationPointList.svelte";

    let { actor, config } = $props();
    let system = $state(actor.system);

    let attributeAssignmentLocked = getActorStore(
        actor.id,
        stores.attributeAssignmentLocked,
        actor.getFlag(flags.sr3e, flags.actor.attributeAssignmentLocked),
    );

    // Store retrieval with lazy init
    let intelligenceStore = getActorStore(
        actor.id,
        stores.intelligence,
        actor.system.attributes.intelligence.value +
            actor.system.attributes.intelligence.mod +
            actor.system.attributes.intelligence.meta ?? 0,
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
        system.creation.knowledgePoints,
    );
    let languagePointStore = getActorStore(
        actor.id,
        stores.languagePoints,
        system.creation.languagePoints,
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

    // Update dependent values when intelligence changes
    $effect(() => {
        knowledgePointStore.set($intelligenceStore * 5);
        languagePointStore.set(Math.floor($intelligenceStore * 1.5));
    });

    // Watch attributePointStore changes and update Foundry data
    $effect(() => {
        const value = $attributePointStore;
        actor.update(
            {
                "system.creation.attributePoints": value,
            },
            { render: false },
        );
    });

    // Watch skillPointStore changes and update Foundry data
    $effect(() => {
        const value = $skillPointStore;
        actor.update(
            {
                "system.creation.activePoints": value,
            },
            { render: false },
        );
    });

    // Watch knowledgePointStore changes and update Foundry data
    $effect(() => {
        const value = $knowledgePointStore;
        actor.update(
            {
                "system.creation.knowledgePoints": value,
            },
            { render: false },
        );
    });

    // Watch languagePointStore changes and update Foundry data
    $effect(() => {
        const value = $languagePointStore;
        actor.update(
            {
                "system.creation.languagePoints": value,
            },
            { render: false },
        );
    });

    $effect(() => {
        if (
            $attributePointStore === 0 &&
            $attributeAssignmentLocked === false
        ) {
            (async () => {
                const confirmed =
                    await foundry.applications.api.DialogV2.confirm({
                        window: {
                            title: localize(
                                config.modal.exitattributesassignment,
                            ),
                        },
                        content: localize(
                            config.modal.exitattributesassignment,
                        ),
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
                        flags.actor.attributeAssignmentLocked,
                        true,
                    );
                    $attributeAssignmentLocked = true;
                }
            })();
        }
    });
</script>

<CreationPointList
    points={pointList}
    containerCSS={"attribute-point-assignment"}
/>
