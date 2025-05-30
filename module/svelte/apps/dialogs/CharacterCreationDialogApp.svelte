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

    //NOTE: If the system has no human item, one must be creted
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
        ItemDataService.getAllMetaHumans(metahumans); // returns objects like { priority: "E", name: "Human", id: "eoiwjklföklw020" },
    const magicsDropdwonOptions = ItemDataService.getAllMagics(magics); // returns objects like { priority: "E", name: "Unawakened", foundryitemid: "E-foundryItemId" },
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

    async function handleSubmit(event) {
        event.preventDefault();

        await actor.update({
            "system.profile.age": characterAge,
            "system.profile.height": characterHeight,
            "system.profile.weight": characterWeight,
            "system.creation.attributePoints": selectedAttribute.points,
            "system.creation.activePoints": selectedSkill.points,
        });

        // Embed selected metahuman
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
        let id = e.target.value.foundryitemid;
        metahumanItem = game.item.get(id);
    }

    function handleClear() {
        console.log("Randomize Not implemented");
    }

    function handleCancel() {
        console.log("Character creation cancelled");
        onCancel?.();
    }
</script>

<form onsubmit={handleSubmit}>
    <div class="sr3e-item-grid">
        <!-- Name and Priority -->
        <div class="item-sheet-component">
            <div class="sr3e-inner-background-container">
                <div class="fake-shadow"></div>
                <div class="sr3e-inner-background">
                    <label for="age-slider"
                        >{localize(config.traits.age)}: {characterAge}</label
                    >
                    <input
                        id="age-slider"
                        type="range"
                        min={metahumanItem.system.agerange.min ?? 0}
                        max={metahumanItem.system.agerange.max ?? 100}
                        step="1"
                        bind:value={characterAge}
                    />

                    <label for="height-slider"
                        >{localize(config.traits.height)}: {characterHeight}</label
                    >
                    <input
                        id="height-slider"
                        type="range"
                        min={metahumanItem.system.physical.height.min ?? 0}
                        max={metahumanItem.system.physical.height.max ?? 100}
                        step="1"
                        bind:value={characterHeight}
                    />
                    <label for="weight-slider"
                        >{localize(config.traits.weight)}: {characterWeight}</label
                    >
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
                    <select
                        id="metahuman-select"
                        bind:value={selectedMetahuman}
                        onchange={onMetahumanValueChanged}
                    >
                        <option value="" disabled selected hidden
                            >{chooseAnOption}</option
                        >
                        {#each metahumanDropdownOptions as metahuman}
                            <option value={metahuman.foundryitemid}
                                >{metahuman.priority}: {metahuman.name}</option
                            >
                        {/each}
                    </select>

                    <select id="magic-select" bind:value={selectedMagic}>
                        <option value="" disabled selected hidden
                            >{chooseAnOption}</option
                        >
                        {#each magicsDropdwonOptions as magic}
                            <option value={magic.foundryitemid}
                                >{magic.priority}: {magic.name}</option
                            >
                        {/each}
                    </select>

                    <select
                        id="attributes-select"
                        bind:value={selectedAttribute}
                    >
                        <option value="" disabled selected hidden
                            >{chooseAnOption}</option
                        >
                        {#each attributPointDropdownOptions as attribute}
                            <option value={attribute.priority}
                                >{attribute.priority}: {attribute.points}</option
                            >
                        {/each}
                    </select>

                    <select id="skills-select" bind:value={selectedSkill}>
                        <option value="" disabled selected hidden
                            >{chooseAnOption}</option
                        >
                        {#each skillPointDropdwonOptions as skill}
                            <option value={skill.priority}
                                >{skill.priority}: {skill.points}</option
                            >
                        {/each}
                    </select>

                    <select id="resource-select" bind:value={selectedResource}>
                        <option value="" disabled selected hidden
                            >{chooseAnOption}</option
                        >
                        {#each resourcesDropdownOptions as resource}
                            <option value={resource.priority}
                                >{resource.priority}: {resource.points}</option
                            >
                        {/each}
                    </select>
                </div>
            </div>
            <div class="item-sheet-component">
                <div class="sr3e-inner-background-container">
                    <div class="fake-shadow"></div>
                    <div class="sr3e-inner-background">
                        <label for="character-name">Character Name</label>
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
                        <label for="character-name">Character Name</label>
                        <div class="form-group">
                            <button type="button" onclick={handleRandomize}
                                >{localize(config.sheet.randomize)}</button
                            >
                            <button type="button" onclick={handleClear}
                                >{localize(config.sheet.clear)}</button
                            >
                            <button type="submit"
                                >{localize(
                                    config.sheet.createCharacter,
                                )}</button
                            >
                            <button type="button" onclick={handleCancel}
                                >{localize(config.sheet.cancel)}</button
                            >
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</form>
