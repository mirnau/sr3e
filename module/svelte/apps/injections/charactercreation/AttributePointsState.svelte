<script>
    import { localize } from "../../../../svelteHelpers.js";
    import { flags } from "../../../../foundry/services/commonConsts.js";
    import { getActorStore, stores } from "../../../stores/actorStores.js";
    import CreationPointList from "../../components/CreationPointList.svelte";

    let { actor, config } = $props();
    let system = $state(actor.system);

    let isAssigningAttributesStore = getActorStore(
        actor.id,
        stores.isAssigningAttributes,
        actor.getFlag(flags.sr3e, flags.actor.isAssigningAttributes),
    );

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
        system.creation.knowledgePoints,
    );
    let languagePointStore = getActorStore(
        actor.id,
        stores.languagePoints,
        system.creation.languagePoints,
    );

    // Reactive intelligence value
    let intelligence = $state(0);

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
        knowledgePointStore.set(intelligence * 5);
        languagePointStore.set(Math.floor(intelligence * 1.5));
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
        if ($attributePointStore === 0) {
            (async () => {
                const confirmed =
                    await foundry.applications.api.DialogV2.confirm({
                        window: {
                            title: "Finish Attribute Point Assignement?",
                        },
                        content:
                            "You've used all your attribute points. Are you ready to continue with skill assignment?",
                        yes: {
                            label: "Yes, finish",
                            default: true,
                        },
                        no: {
                            label: "Not yet",
                        },
                        modal: true,
                        rejectClose: true,
                    });

                if (confirmed) {
                    actor.setFlag(
                        flags.sr3e,
                        flags.actor.attributeAssignmentLocked,
                        false,
                    );
                    $isAssigningAttributesStore = false;
                }
            })();
        }
    });
</script>

<CreationPointList
    points={pointList}
    containerCSS={"attribute-point-assignment"}
/>
