<script>
    import { openFilePicker, localize } from "../../../../svelteHelpers.js";
    import SpecializationCard from "./SpecializationCard.svelte";
    import { onDestroy, tick } from "svelte";
    import { getActorStore, stores } from "../../../stores/actorStores.js";
    import { flags } from "../../../../foundry/services/commonConsts.js";
    import { get, set } from "svelte/store";

    let { skill, actor, config, app } = $props();

    let specializations = getActorStore(
        skill.id,
        actor.id,
        skill.system.activeSkill.specializations,
    );

    const activeSkillsIdArrayStore = getActorStore(
        actor.id,
        stores.activeSkillsIds,
        actor.items
            .filter(
                (item) =>
                    item.type === "skill" && item.system.skillType === "active",
            )
            .map((item) => item.id),
    );

    let disableValueControls = $derived($specializations.length > 0);

    $effect(() => {
        skill.update(
            { "system.activeSkill.specializations": $specializations },
            { render: false },
        );
    });

    let layoutMode = $state("single");

    let value = getActorStore(
        actor.id,
        skill.id,
        skill.system.activeSkill.value,
    );

    let linkedAttribute = skill.system.activeSkill.linkedAttribute;
    let linkedAttributeRating = $state(
        Number(
            foundry.utils.getProperty(
                actor,
                `system.attributes.${linkedAttribute}.value`,
            ),
        ) +
            Number(
                foundry.utils.getProperty(
                    actor,
                    `system.attributes.${linkedAttribute}.mod`,
                ),
            ),
    );

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

    async function addNewSpecialization() {
        if (actor.getFlag(flags.sr3e, flags.actor.isCharacterCreation)) {
            if ($specializations.length > 0) {
                ui.notifications.info(
                    localize(config.skill.onlyonespecializationatcreation),
                );
                return;
            }
        }

        let newSkill = {
            name: localize(config.skill.newspecialization),
            value: 0,
        };

        $specializations.push(newSkill);
        $specializations = [...$specializations];

        await skill.update(
            {
                "system.activeSkill.specializations": $specializations,
            },
            { render: false },
        );
    }

    async function increment() {
        if ($attributeAssignmentLocked) {
            if ($value < 6) {
                let costForNextLevel;

                if ($value < linkedAttributeRating) {
                    costForNextLevel = 1;
                } else {
                    costForNextLevel = 2;
                }

                if ($skillPointStore >= costForNextLevel) {
                    $value += 1;
                    $skillPointStore -= costForNextLevel;
                }
            }
        } else {
            assignFirstMessage();
        }
        silentUpdate();
    }

    async function decrement() {
        if ($attributeAssignmentLocked) {
            if ($value > 0) {
                let refundForCurrentLevel;

                if ($value > linkedAttributeRating) {
                    refundForCurrentLevel = 2;
                } else {
                    refundForCurrentLevel = 1;
                }

                $value -= 1;
                $skillPointStore += refundForCurrentLevel;
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

    async function deleteThis() {
        const confirmed = await foundry.applications.api.DialogV2.confirm({
            window: {
                title: "Delete This Skill?",
            },
            content: "Do you want to delete this skill?",
            yes: {
                label: "Yes!",
                default: true,
            },
            no: {
                label: "Nope!",
            },
            modal: true,
            rejectClose: true,
        });

        if (confirmed) {
            if (actor.getFlag(flags.sr3e, flags.actor.isCharacterCreation)) {
                if ($specializations.length > 0) {
                    $specializations = [];
                    await tick(); // import { tick } from "svelte";
                    $value += 1;
                }

                let refund = 0;
                for (let i = 1; i <= $value; i++) {
                    if (i <= linkedAttributeRating) refund += 1;
                    else refund += 2;
                }

                $skillPointStore += refund;
                $value = 0;

                ui.notifications.info(
                    localize(config.skill.skillpointsrestored),
                );
            }

            if (skill) {
                const id = skill.id;
                await actor.deleteEmbeddedDocuments("Item", [id], {
                    render: false,
                });

                const store = getActorStore(actor.id, stores.activeSkillsIds);
                const current = get(store);
                store.set(current.filter((sid) => sid !== id));
            }

            app.close();
        }
    }

    function deleteSpecialization(event) {
        const toDelete = event.detail.specialization;
        $specializations = $specializations.filter((s) => s !== toDelete);
    }
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
                                    disabled={disableValueControls}
                                >
                                    <i class="fa-solid fa-plus"></i>
                                </button>
                                <button
                                    class="header-control icon sr3e-toolbar-button"
                                    aria-label="Toggle card span"
                                    onclick={decrement}
                                    disabled={disableValueControls}
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
                                    disabled={$value <= 1}
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
                    <div class="stat-grid single-column">
                        {#each $specializations as specialization, i}
                            <SpecializationCard
                                bind:specialization={$specializations[i]}
                                {actor}
                                {skill}
                                on:arrayChanged={() => {
                                    $specializations = [...$specializations];
                                    console.log("array was reassigned");
                                }}
                                on:delete={deleteSpecialization}
                            />
                        {/each}
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
