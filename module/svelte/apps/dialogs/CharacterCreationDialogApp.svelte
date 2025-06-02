<script>
    import { onMount } from "svelte";
    import {
        localize,
        openFilePicker,
        getRandomIntinRange,
        getRandomBellCurveWithMode,
    } from "../../../svelteHelpers";
    import ActorDataService from "../../../foundry/services/ActorDataService.js";
    import ItemDataService from "../../../foundry/services/ItemDataService.js";
    import CharacterGeneratorService from "../../../foundry/services/CharacterGeneratorService.js";
    import { flags } from "../../../foundry/services/commonConsts.js";
    import { attributePointStore, skillPointStore } from "../../../svelteStore.js";

    let { actor, config, onSubmit, onCancel } = $props();
    let system = $state(actor.system);
    let characterName = $state(actor.name);
    let characterAge = $state(25);
    let characterWeight = $state(75);
    let characterHeight = $state(175);
    let selectedMetahuman = $state("");
    let selectedMagic = $state("");
    let selectedAttribute = $state("");
    let selectedSkill = $state("");
    let selectedResource = $state("");
    let chooseAnOption = localize(config.sheet.chooseanoption);
    let metahumanItem = $state(null);
    let metahumans = $state([]);
    let magics = $state([]);

    onMount(async () => {
        metahumans = ItemDataService.getAllItemsOfType("metahuman");

        if (metahumans.length === 0) {
            const humanItem = ItemDataService.getDefaultHumanItem();
            await Item.create(humanItem);
            metahumans = ItemDataService.getAllItemsOfType("metahuman");
        }

        magics = ItemDataService.getAllItemsOfType("magic");

        if (magics.length === 0) {
            const magicItem = ItemDataService.getDefaultMagic();
            await Item.create(magicItem);
            magics = ItemDataService.getAllItemsOfType("magic");
        }

        metahumanItem =
            metahumans.find((m) => m.name === "Human") || metahumans[0];
        console.log(
            "Available metahumans:",
            metahumans.map((m) => m.name),
        );
        console.log("Selected default metahuman:", metahumanItem?.name);
    });

    const metahumanDropdownOptions = $derived(
        ItemDataService.getAllMetaHumans(metahumans),
    );
    const magicsDropdownOptions = $derived(
        ItemDataService.getAllMagics(magics),
    );
    const priorities = ActorDataService.getCharacterCreationStats();
    const attributPointDropdownOptions = priorities.attributes;
    const skillPointDropdownOptions = priorities.skills;
    const resourcesDropdownOptions = priorities.resources;

    let priority = CharacterGeneratorService.generatePriorityCombination(
        // svelte-ignore state_referenced_locally
        metahumans[0],
        // svelte-ignore state_referenced_locally
        magics[0],
    );

    console.log("CHARACTER", actor);

    $effect(() => {
        if (selectedMetahuman) {
            const foundItem = metahumans.find(
                (i) => i.id === selectedMetahuman,
            );
            if (foundItem) {
                metahumanItem = foundItem;
            }
        } else {
            const fallback =
                metahumans.find((m) => m.name === "Human") || metahumans[0];
            if (fallback) {
                metahumanItem = fallback;
            }
        }
    });

    $effect(() => {
        if (actor && characterName !== actor.name) {
            actor.name = characterName;
            if (characterName.length > 0) {
                actor.update({ name: characterName });
            }
        }
    });

    let canCreate = $derived(
        selectedMetahuman &&
            selectedMagic &&
            selectedAttribute &&
            selectedSkill &&
            selectedResource,
    );

    let ageMin = 0;
    let ageMax = $derived(metahumanItem?.system?.agerange?.max ?? 100);

    let lifespan = $derived(ageMax - ageMin);
    let phaseTemplate = ActorDataService.getPhaseTemplate();

    let agePhases = $derived(
        phaseTemplate.map((p) => {
            const from = ageMin + p.from * lifespan;
            const to = ageMin + p.to * lifespan;
            const midpoint = (from + to) / 2;
            return {
                text: p.text,
                from,
                to,
                midpoint,
                percent: ((midpoint - ageMin) / lifespan) * 100,
            };
        }),
    );

    let currentPhase = $derived(
        agePhases.find((p) => characterAge >= p.from && characterAge <= p.to)
            ?.text ?? "",
    );

    let usedPriorities = $state([]);

    $effect(() => {
        const arr = [];
        const m = metahumanDropdownOptions.find(
            (o) => o.foundryitemid === selectedMetahuman,
        );
        if (m) arr.push(m.priority);
        const g = magicsDropdownOptions.find(
            (o) => o.foundryitemid === selectedMagic,
        );
        if (g) arr.push(g.priority);
        if (selectedAttribute) arr.push(selectedAttribute);
        if (selectedSkill) arr.push(selectedSkill);
        if (selectedResource) arr.push(selectedResource);
        usedPriorities = arr;
    });

    async function handleSubmit(event) {
        event.preventDefault();

        console.log("Handle submit was entered");

        const selectedAttributeObj = attributPointDropdownOptions.find(
            (attr) => attr.priority === selectedAttribute,
        );
        const selectedSkillObj = skillPointDropdownOptions.find(
            (skill) => skill.priority === selectedSkill,
        );

        $attributePointStore = selectedAttributeObj.points - 18;
        $skillPointStore = selectedSkillObj.points;

        await actor.update({
            "system.profile.age": characterAge,
            "system.profile.height": characterHeight,
            "system.profile.weight": characterWeight,
            "system.creation.attributePoints":  $attributePointStore,
            "system.creation.activePoints": $skillPointStore,
            "system.attributes.body.value": 3,
            "system.attributes.quickness.value": 3,
            "system.attributes.strength.value": 3,
            "system.attributes.charisma.value": 3,
            "system.attributes.intelligence.value": 3,
            "system.attributes.willpower.value": 3,
        });

        const metahuman = metahumans.find((m) => m.id === selectedMetahuman);
        const worldMetahuman = game.items.get(metahuman.id);
        await actor.createEmbeddedDocuments("Item", [
            worldMetahuman.toObject(),
        ]);

        const magic = magics.find((m) => m.id === selectedMagic);
        if (["A", "B"].includes(selectedMagic.priority)) {
            const worldMagic = game.items.get(magic.id);
            await actor.createEmbeddedDocuments("Item", [
                worldMagic.toObject(),
            ]);

            actor.setFlag(flags.sr3e, flags.actor.hasAwakened, true);

            await actor.update({ "system.attributes.magic.value": 6 });
        }

        onSubmit?.(true);

        console.log("Handle submit was exited");
    }

    function handleRandomize() {
        let combo, metaOpts, magicOpts;
        do {
            combo = CharacterGeneratorService.generatePriorityCombination({
                metahumanOptions: metahumanDropdownOptions,
                magicOptions: magicsDropdownOptions,
            });
            metaOpts = metahumanDropdownOptions.filter(
                (i) => i.priority === combo.metahuman,
            );
            magicOpts = magicsDropdownOptions.filter(
                (i) => i.priority === combo.magic,
            );
        } while (!metaOpts.length || !magicOpts.length);

        selectedMetahuman =
            metaOpts[getRandomIntinRange(0, metaOpts.length - 1)].foundryitemid;
        selectedMagic =
            magicOpts[getRandomIntinRange(0, magicOpts.length - 1)]
                .foundryitemid;

        metahumanItem = metahumans.find((i) => i.id === selectedMetahuman);

        const ageSrc =
            metahumanItem.system.agerange ?? metahumanItem.system.lifespan;
        characterAge = getRandomBellCurveWithMode(
            ageSrc.min,
            ageSrc.max,
            ageSrc.average,
        );

        const h = metahumanItem.system.physical.height;
        characterHeight = getRandomBellCurveWithMode(h.min, h.max, h.average);

        const w = metahumanItem.system.physical.weight;
        characterWeight = getRandomBellCurveWithMode(w.min, w.max, w.average);

        selectedAttribute = combo.attribute;
        selectedSkill = combo.skills;
        selectedResource = combo.resources;
    }

    function handleClear() {
        selectedMetahuman = "";
        selectedMagic = "";
        selectedAttribute = "";
        selectedSkill = "";
        selectedResource = "";

        characterAge = 25;
        characterHeight = 175;
        characterWeight = 75;

        metahumanItem =
            metahumans.find((m) => m.name === "Human") || metahumans[0];
    }
</script>

<form onsubmit={handleSubmit}>
    <div class="sr3e-general-grid">
        <!-- Header -->
        <div class="item-sheet-component">
            <div class="sr3e-inner-background-container">
                <div class="fake-shadow"></div>
                <div class="sr3e-inner-background">
                    <div class="image-mask">
                        <img
                            src={metahumanItem?.img ?? ""}
                            role="presentation"
                            data-edit="img"
                            title={metahumanItem?.name ?? ""}
                            alt={metahumanItem?.name ?? ""}
                        />
                    </div>
                    <input
                        id="character-name"
                        type="text"
                        bind:value={characterName}
                        placeholder="Enter character name"
                    />
                </div>
            </div>
        </div>
        <div class="item-sheet-component">
            <div class="sr3e-inner-background-container">
                <div class="fake-shadow"></div>
                <div class="sr3e-inner-background">
                    <div for="age-slider">
                        {localize(config.traits.age)}: {characterAge} ({currentPhase})
                    </div>

                    <input
                        id="age-slider"
                        type="range"
                        min={metahumanItem?.system?.agerange?.min ?? 0}
                        max={metahumanItem?.system?.agerange?.max ?? 100}
                        step="1"
                        bind:value={characterAge}
                    />

                    <div for="height-slider">
                        {localize(config.traits.height)}: {characterHeight}
                    </div>
                    <input
                        id="height-slider"
                        type="range"
                        min={metahumanItem?.system?.physical?.height?.min ?? 0}
                        max={metahumanItem?.system?.physical?.height?.max ??
                            200}
                        step="1"
                        bind:value={characterHeight}
                    />
                    <div for="weight-slider">
                        {localize(config.traits.weight)}: {characterWeight}
                    </div>
                    <input
                        id="weight-slider"
                        type="range"
                        min={metahumanItem?.system?.physical?.weight?.min ?? 0}
                        max={metahumanItem?.system?.physical?.weight?.max ??
                            200}
                        step="1"
                        bind:value={characterWeight}
                    />
                </div>
            </div>
        </div>
        <div class="item-sheet-component">
            <div class="sr3e-inner-background-container">
                <div class="fake-shadow"></div>
                <div class="sr3e-inner-background">
                    <div>
                        <div class="creation-dropdwn">
                            <h3>{localize(config.traits.metahumanity)}</h3>
                            <select
                                id="metahuman-select"
                                bind:value={selectedMetahuman}
                            >
                                <option value="" disabled selected hidden
                                    >{chooseAnOption}</option
                                >
                                {#each metahumanDropdownOptions as metahuman}
                                    <option value={metahuman.foundryitemid}>
                                        {metahuman.priority}: {metahuman.name}
                                    </option>
                                {/each}
                            </select>
                        </div>
                        <div class="creation-dropdwn">
                            <h3>{localize(config.magic.tradition)}</h3>
                            <select
                                id="magic-select"
                                bind:value={selectedMagic}
                            >
                                <option value="" disabled selected hidden
                                    >{chooseAnOption}</option
                                >
                                {#each magicsDropdownOptions as magic}
                                    <option
                                        value={magic.foundryitemid}
                                        disabled={usedPriorities.includes(
                                            magic.priority,
                                        ) &&
                                            magic.foundryitemid !==
                                                selectedMagic}
                                        >{magic.priority}: {magic.name}</option
                                    >
                                {/each}
                            </select>
                        </div>
                        <div class="creation-dropdwn">
                            <h3>{localize(config.sheet.attributepoints)}</h3>
                            <select
                                id="attributes-select"
                                bind:value={selectedAttribute}
                            >
                                <option value="" disabled selected hidden
                                    >{chooseAnOption}</option
                                >
                                {#each attributPointDropdownOptions as attribute}
                                    <option
                                        value={attribute.priority}
                                        disabled={usedPriorities.includes(
                                            attribute.priority,
                                        ) &&
                                            attribute.priority !==
                                                selectedAttribute}
                                        >{attribute.priority}: {attribute.points}</option
                                    >
                                {/each}
                            </select>
                        </div>
                        <div class="creation-dropdwn">
                            <h3>{localize(config.sheet.skillpoints)}</h3>
                            <select
                                id="skills-select"
                                bind:value={selectedSkill}
                            >
                                <option value="" disabled selected hidden
                                    >{chooseAnOption}</option
                                >
                                {#each skillPointDropdownOptions as skill}
                                    <option
                                        value={skill.priority}
                                        disabled={usedPriorities.includes(
                                            skill.priority,
                                        ) && skill.priority !== selectedSkill}
                                        >{skill.priority}: {skill.points}</option
                                    >
                                {/each}
                            </select>
                        </div>
                        <div class="creation-dropdwn">
                            <h3>{localize(config.sheet.resources)}</h3>
                            <select
                                id="resource-select"
                                bind:value={selectedResource}
                            >
                                <option value="" disabled selected hidden
                                    >{chooseAnOption}</option
                                >
                                {#each resourcesDropdownOptions as resource}
                                    <option
                                        value={resource.priority}
                                        disabled={usedPriorities.includes(
                                            resource.priority,
                                        ) &&
                                            resource.priority !==
                                                selectedResource}
                                        >{resource.priority}: {resource.points}</option
                                    >
                                {/each}
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="item-sheet-component">
            <div class="sr3e-inner-background-container">
                <div class="fake-shadow"></div>
                <div class="sr3e-inner-background">
                    <div class="character-creation-buttonpanel">
                        <!-- Randomize -->
                        <button type="button" onclick={handleRandomize}>
                            <i class="fas fa-dice"></i>
                            {localize(config.sheet.randomize)}
                        </button>

                        <!-- Clear -->
                        <button type="button" onclick={handleClear}>
                            <i class="fas fa-eraser"></i>
                            {localize(config.sheet.clear)}
                        </button>

                        <!-- Create Character -->
                        <button type="submit" disabled={!canCreate}>
                            <i class="fas fa-check"></i>
                            {localize(config.sheet.createCharacter)}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</form>
