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

    let metahumans = ItemDataService.getAllItemsOfType("metahuman");

    if (metahumans.length === 0) {
        const humanItem = ItemDataService.getDefaultHumanItem();
        Item.create(humanItem);
        metahumans = ItemDataService.getAllItemsOfType("metahuman");
    }

    let magics = ItemDataService.getAllItemsOfType("magic");

    if (magics.length === 0) {
        const magicItem = ItemDataService.getDefaultMagic();
        Item.create(magicItem);
        magics = getAllItemsOfType("magic");
    }

    const metahumanDropdownOptions =
        ItemDataService.getAllMetaHumans(metahumans);
    const magicsDropdwonOptions = ItemDataService.getAllMagics(magics);
    const priorities = ActorDataService.getCharacterCreationStats();
    const attributPointDropdownOptions = priorities.attributes;
    const skillPointDropdwonOptions = priorities.skills;
    const resourcesDropdownOptions = priorities.resources;

    let priority = CharacterGeneratorService.generatePriorityCombination(
        metahumans[0],
        magics[0],
    );

    console.log("CHARACTER", actor);
    let metahumanItem = $state(ItemDataService.getHumanItem());

    $effect(() => {
        metahumanItem ??= ItemDataService.getHumanItem();
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

    let ageMin = 0; // Note: for his calculation
    let ageMax = $derived(metahumanItem.system.agerange.max);

    let lifespan = $derived(ageMax - ageMin);
    let phaseTemplate = ActorDataService.getPhaseTemplate();

    let agePhases = $derived(
        phaseTemplate.map((p) => {
            const from = ageMin + p.from * lifespan;
            const to = ageMin + p.to * lifespan;
            const midpoint = (from + to) / 2;
            return {
                div: p.div,
                from,
                to,
                midpoint,
                percent: ((midpoint - ageMin) / lifespan) * 100,
            };
        }),
    );

    let currentPhase = $derived(
        agePhases.find((p) => characterAge >= p.from && characterAge <= p.to)
            ?.div ?? "",
    );

    let usedPriorities = $state([]);

    $effect(() => {
        const arr = [];
        const m = metahumanDropdownOptions.find(
            (o) => o.foundryitemid === selectedMetahuman,
        );
        if (m) arr.push(m.priority);
        const g = magicsDropdwonOptions.find(
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

        await actor.update({
            "system.profile.age": characterAge,
            "system.profile.height": characterHeight,
            "system.profile.weight": characterWeight,
            "system.creation.attributePoints": selectedAttribute.points,
            "system.creation.activePoints": selectedSkill.points,
        });

        const metahuman = metahumans.find((m) => m.id === selectedMetahuman);
        const worldMetahuman = game.items.get(metahuman.id);
        await actor.createEmbeddedDocuments("Item", [
            worldMetahuman.toObject(),
        ]);

        const magic = magics.find((m) => m.id === selectedMagic);
        if (["A", "B"].includes(magicPriority)) {
            const worldMagic = game.items.get(magic.id);
            await actor.createEmbeddedDocuments("Item", [
                worldMagic.toObject(),
            ]);
        }

        console.log("Character created:", {
            name: characterName,
            metahuman: metahuman.name,
            magic: magic?.name,
            age: characterAge,
            height: characterHeight,
            weight: characterWeight,
        });

        onSubmit?.(true);
    }

    function handleRandomize() {
        let combo, metaOpts, magicOpts;
        do {
            combo = CharacterGeneratorService.generatePriorityCombination({
                metahumanOptions: metahumanDropdownOptions,
                magicOptions: magicsDropdwonOptions,
            });
            metaOpts = metahumanDropdownOptions.filter(
                (i) => i.priority === combo.metahuman,
            );
            magicOpts = magicsDropdwonOptions.filter(
                (i) => i.priority === combo.magic,
            );
        } while (!metaOpts.length || !magicOpts.length);

        selectedMetahuman =
            metaOpts[getRandomIntinRange(0, metaOpts.length - 1)].foundryitemid;
        selectedMagic =
            magicOpts[getRandomIntinRange(0, magicOpts.length - 1)]
                .foundryitemid;

        metahumanItem = game.items.get(selectedMetahuman);

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

    function onMetahumanValueChanged(e) {
        const id = e.target.value;
        if (!id) {
            metahumanItem = ItemDataService.getHumanItem();
            return;
        }
        metahumanItem = game.items.get(id);
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

        metahumanItem = ItemDataService.getHumanItem();
    }

    function handleCancel() {
        console.log("Character creation cancelled");
        onCancel?.();
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
                            src={metahumanItem.img}
                            role="presentation"
                            data-edit="img"
                            title={metahumanItem.name}
                            alt={metahumanItem.name}
                        />
                    </div>
                </div>
            </div>
        </div>
        <div class="item-sheet-component">
            <div class="sr3e-inner-background-container">
                <div class="fake-shadow"></div>
                <div class="sr3e-inner-background">
                    <div for="age-slider">
                        {localize(config.traits.age)}: {characterAge}
                        {#if currentPhase}
                            ({currentPhase}){/if}
                    </div>

                    <input
                        id="age-slider"
                        type="range"
                        min={metahumanItem.system.agerange.min ?? 0}
                        max={metahumanItem.system.agerange.max ?? 100}
                        step="1"
                        bind:value={characterAge}
                    />

                    <div for="height-slider">
                        {localize(config.traits.height)}: {characterHeight}
                    </div>
                    <input
                        id="height-slider"
                        type="range"
                        min={metahumanItem.system.physical.height.min ?? 0}
                        max={metahumanItem.system.physical.height.max ?? 100}
                        step="1"
                        bind:value={characterHeight}
                    />
                    <div for="weight-slider">
                        {localize(config.traits.weight)}: {characterWeight}
                    </div>
                    <input
                        id="weight-slider"
                        type="range"
                        min={metahumanItem.system.physical.weight.min ?? 0}
                        max={metahumanItem.system.physical.weight.max ?? 100}
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
                            <h3>Mock</h3>
                            <select
                                id="metahuman-select"
                                bind:value={selectedMetahuman}
                                onchange={onMetahumanValueChanged}
                            >
                                <option value="" disabled selected hidden
                                    >{chooseAnOption}</option
                                >
                                {#each metahumanDropdownOptions as metahuman}
                                    <option
                                        value={metahuman.foundryitemid}
                                        disabled={usedPriorities.includes(
                                            metahuman.priority,
                                        ) &&
                                            metahuman.foundryitemid !==
                                                selectedMetahuman}
                                        >{metahuman.priority}: {metahuman.name}</option
                                    >
                                {/each}
                            </select>
                        </div>
                        <div class="creation-dropdwn">
                            <h3>Mock</h3>
                            <select
                                id="magic-select"
                                bind:value={selectedMagic}
                            >
                                <option value="" disabled selected hidden
                                    >{chooseAnOption}</option
                                >
                                {#each magicsDropdwonOptions as magic}
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
                            <h3>Mock</h3>
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
                            <h3>Mock</h3>
                            <select
                                id="skills-select"
                                bind:value={selectedSkill}
                            >
                                <option value="" disabled selected hidden
                                    >{chooseAnOption}</option
                                >
                                {#each skillPointDropdwonOptions as skill}
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
                            <h3>Mock</h3>
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
                    <div for="character-name">Character Name</div>
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
                    <div class="character-creation-buttonpanel">
                        <button type="button" onclick={handleRandomize}
                            >{localize(config.sheet.randomize)}</button
                        >
                        <button type="button" onclick={handleClear}
                            >{localize(config.sheet.clear)}</button
                        >
                        <button type="submit" disabled={!canCreate}
                            >{localize(config.sheet.createCharacter)}</button
                        >
                        <button type="button" onclick={handleCancel}
                            >{localize(config.sheet.cancel)}</button
                        >
                    </div>
                </div>
            </div>
        </div>
    </div>
</form>
