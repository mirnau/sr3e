<script>
    import { openFilePicker, localize } from "../../../../svelteHelpers.js";
    import SpecializationCard from "./SpecializationCard.svelte";
    import { onDestroy, tick } from "svelte";
    import { getActorStore, stores } from "../../../stores/actorStores.js";
    import { flags } from "../../../../foundry/services/commonConsts.js";
    import { get, set } from "svelte/store";

    let { skill, actor, config, app } = $props();

    console.log("skill", skill);

    let specializations = getActorStore(
        skill.id,
        actor.id,
        skill.system.languageSkill.specializations ?? [],
    );

    let isCharacterCreation = getActorStore(
        actor.id,
        stores.isCharacterCreation,
        actor.getFlag(flags.sr3e, flags.actor.isCharacterCreation),
    );

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

    let layoutMode = $state("single");

    let value = getActorStore(
        actor.id,
        skill.id,
        skill.system.languageSkill.value,
    );

    let linkedAttribute = skill.system.languageSkill.linkedAttribute;
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
        stores.languagePoints,
        actor.system.creation.languagePoints,
    );
    let attributeAssignmentLocked = getActorStore(
        actor.id,
        stores.attributeAssignmentLocked,
        actor.getFlag(flags.sr3e, flags.actor.attributeAssignmentLocked),
    );

    let readWrite = $derived($value <= 1 ? 0 : Math.floor($value / 2));
    let disableValueControls = $derived($specializations?.length > 0);

    $effect(() => {
        skill.update(
            { "system.languageSkill.specializations": $specializations },
            { render: false },
        );
        skill.update(
            { "system.languageSkill.readwrite.value": readWrite },
            { render: false },
        );
    });

    async function addNewSpecialization() {
        if (!$specializations)
            throw new Error("Cannot add lingo: specialization store is null");

        if (actor.getFlag(flags.sr3e, flags.actor.isCharacterCreation)) {
            if ($specializations.length > 0) {
                ui.notifications.info(
                    localize(config.skill.onlyonespecializationatcreation),
                );
                return;
            }
            $specializations.push({
                name: localize(config.skill.newspecialization),
                value: $value + 1,
            });
            $value -= 1;
        } else {
            $specializations.push({
                name: localize(config.skill.newspecialization),
                value: 0,
            });
        }
        $specializations = [...$specializations];
        await skill.update(
            { "system.languageSkill.specializations": $specializations },
            { render: false },
        );
    }

    async function increment() {
        if ($attributeAssignmentLocked) {
            if ($isCharacterCreation) {
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
                console.log("TODO: implement karma based shopping");
            }
        } else {
            ui.notifications.warn(
                localize(config.notifications.assignattributesfirst),
            );
        }
        silentUpdate();
    }

    async function decrement() {
        if ($attributeAssignmentLocked) {
            if ($isCharacterCreation) {
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
                console.log("TODO: implement karma based shopping");
            }
        } else {
            ui.notifications.warn(
                localize(config.notifications.assignattributesfirst),
            );
        }

        await silentUpdate();
    }

    async function silentUpdate() {
        await skill.update(
            {
                "system.languageSkill.value": $value,
                "system.languageSkill.readwrite.value": readWrite,
            },
            { render: false },
        );

        await actor.update(
            { "system.creation.languagePoints": $skillPointStore },
            { render: false },
        );
    }

    async function deleteThis() {
        const confirmed = await foundry.applications.api.DialogV2.confirm({
            window: {
                title: localize(config.modal.deleteskilltitle),
            },
            content: localize(config.modal.deleteskill),
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
            if ($isCharacterCreation) {
                if ($specializations.length > 0) {
                    $specializations = [];
                    await tick();
                    $value += 1;
                }

                let refund = 0;
                for (let i = 1; i <= $value; i++) {
                    refund += i <= linkedAttributeRating ? 1 : 2;
                }

                $skillPointStore += refund;
                $value = 0;

                ui.notifications.info(localize(config.skill.skillpointsrefund));
            }

            await tick();

            const id = skill.id;
            await actor.deleteEmbeddedDocuments("Item", [id], {
                render: false,
            });

            const store = getActorStore(actor.id, stores.languageSkillsIds);
            store.set(get(store).filter((sid) => sid !== id));

            app.close();
        }
    }

    function deleteSpecialization(event) {
        const toDelete = event.detail.specialization;
        $specializations = $specializations.filter((s) => s !== toDelete);
        $value += 1;
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
                            <div class="skill-specialization-card">
                                <div class="specialization-background"></div>
                                <h6>
                                    {localize(config.skill.readwrite)}:
                                </h6>
                                <h1 class="specialization-value">
                                    {readWrite}
                                </h1>
                            </div>
                        </div>

                        <div class="stat-card">
                            <div class="stat-card-background"></div>
                            <div class="buttons-vertical-distribution">
                                <button
                                    class="header-control icon sr3e-toolbar-button"
                                    aria-label="Increase"
                                    onclick={increment}
                                    disabled={disableValueControls}
                                    ><i class="fa-solid fa-plus"></i></button
                                >
                                <button
                                    class="header-control icon sr3e-toolbar-button"
                                    aria-label="Decrease"
                                    onclick={decrement}
                                    disabled={disableValueControls}
                                    ><i class="fa-solid fa-minus"></i></button
                                >
                                <button
                                    class="header-control icon sr3e-toolbar-button"
                                    aria-label="Delete"
                                    onclick={deleteThis}
                                    ><i class="fa-solid fa-trash-can"
                                    ></i></button
                                >
                                <button
                                    class="header-control icon sr3e-toolbar-button"
                                    aria-label="Add Spec"
                                    onclick={addNewSpecialization}
                                    disabled={$value <= 1}
                                    >{localize(config.skill.addlingo)}</button
                                >
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
                        {localize(config.skill.lingos)}
                    </h1>
                    <div class="stat-grid single-column">
                        {#each $specializations as specialization, i}
                            <SpecializationCard
                                bind:specialization={$specializations[i]}
                                {actor}
                                {skill}
                                on:arrayChanged={() => {
                                    $specializations = [...$specializations];
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
