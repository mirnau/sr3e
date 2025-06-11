<script>
    import { openFilePicker, localize } from "../../../../svelteHelpers.js";
    import SpecializationCard from "./SpecializationCard.svelte";
    import { onDestroy } from "svelte";
    import { getActorStore, stores } from "../../../stores/actorStores.js";
    import { flags } from "../../../../foundry/services/commonConsts.js";
    let { skill = {}, actor = {}, config = {} } = $props();

    let specializations = $state(skill.system.specializations);

    let value = getActorStore(
        actor.id,
        skill.id,
        skill.system.activeSkill.value,
    );
    let linkedAttribute = skill.system.linkedAttribute;
    let linkedAttributeRating = $state(
        foundry.utils.getProperty(
            actor,
            `system.attribute.${linkedAttribute}.$value`,
        ) +
            foundry.utils.getProperty(
                actor,
                `system.attribute.${linkedAttribute}.mod`,
            ),
    );

    let layoutMode = $state("single");

    let skillPointStore = getActorStore(
        actor.id,
        stores.activePoints,
        actor.system.creation.activePoints,
    );

    let attributeAssignmentLocked = getActorStore(
        actor.id,
        stores.attributeAssignmentLocked,
        actor.getFlag(flags.sr3e, flags.actor.attributeAssignmentLocked),
    );

    $effect(() => {});

    function addNewSpecialization() {}

    async function increment() {
        if ($attributeAssignmentLocked)
            if ($skillPointStore > 0 && $value < 6) {
                if ($value < linkedAttributeRating) {
                    $value += 1;
                    $skillPointStore -= 1;
                } else if ($skillPointStore > 1) {
                    $value += 2;
                    $skillPointStore -= 2;
                } else {
                    //nothing to do
                }
            } else {
                //nothing to do
            }
        else {
            assignFirstMessage();
        }
        silentUpdate();
    }

    async function decrement() {
        if ($attributeAssignmentLocked) {
            if ($value > 0) {
                if ($value <= linkedAttributeRating) {
                    $value -= 1;
                    $skillPointStore += 1;
                } else {
                    $value -= 1;
                    $skillPointStore += 2;
                }
            }
        } else {
            assignFirstMessage();
        }

        silentUpdate();
    }

    async function silentUpdate() {
        await skill.update(
            { "system.activeSkill.value": $value },
            { render: false },
        );

        await actor.update(
            { "system.creation.activePoints": $skillPointStore },
            { render: false },
        );
    }

    function assignFirstMessage() {
        ui.notifications.warn(
            "You need to assign all attributes before assigning skills",
        );
    }

    $effect(() => {
        console.log("VALUE CHANGED", $value);
    });

    function deleteThis() {
        console.log("TEST");
    }

    onDestroy(async () => {
        await skill.update({ "system.activeSkill.$value": $value });
        await actor.update({
            "system.creation.activePoints": $skillPointStore,
        });
    });
</script>

<div class="sr3e-waterfall-wrapper">
    <div class={`sr3e-waterfall sr3e-waterfall--${layoutMode}`}>
        <div class="item-sheet-component">
            <div class="sr3e-inner-background-container">
                <div class="fake-shadow"></div>
                <div class="sr3e-inner-background">
                    <div class="image-mask">
                        <img
                            src={skill.img}
                            role="presentation"
                            data-edit="img"
                            title={skill.name}
                            alt={skill.name}
                            onclick={async () => openFilePicker(actor)}
                        />
                    </div>
                    <div class="stat-grid single-column">
                        <div class="stat-card">
                            <div class="stat-card-background"></div>
                            <h1>{skill.name}</h1>
                        </div>
                        <div class="stat-card">
                            <div class="stat-card-background"></div>
                            <h1>{$value}</h1>
                        </div>
                        <div class="stat-card">
                            <div class="stat-card-background"></div>
                            <div class="buttons-vertical-distribution">
                                <button
                                    class="header-control icon sr3e-toolbar-button"
                                    aria-label="Toggle card span"
                                    onclick={increment}
                                >
                                    <i class="fa-solid fa-plus"></i>
                                </button>
                                <button
                                    class="header-control icon sr3e-toolbar-button"
                                    aria-label="Toggle card span"
                                    onclick={decrement}
                                >
                                    <i class="fa-solid fa-minus"></i>
                                </button>
                                <button
                                    class="header-control icon sr3e-toolbar-button"
                                    aria-label="Toggle card span"
                                    onclick={deleteThis}
                                >
                                    <i class="fa-solid fa-trash-can"></i>
                                </button>
                                <button
                                    class="header-control icon sr3e-toolbar-button"
                                    aria-label="Toggle card span"
                                    onclick={addNewSpecialization}
                                >
                                    {localize(config.skill.addspecialization)}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="item-sheet-component">
            <div class="sr3e-inner-background-container">
                <div class="fake-shadow"></div>
                <div class="sr3e-inner-background">
                    <h1 class="uppercase">
                        {localize(config.skill.specializations)}
                    </h1>
                    {#each specializations as specialization}
                        <div class="stat-card">
                            <SpecializationCard />
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    </div>
</div>
