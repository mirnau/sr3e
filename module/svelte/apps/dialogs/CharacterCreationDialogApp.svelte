<script>
    import { onMount } from "svelte";
    import {
        localize,
        openFilePicker,
        getRandomIntinRange,
        getRandomBellCurveWithMode,
    } from "../../../services/utilities";
    import ActorDataService from "../../../services/ActorDataService.js"
    import ItemDataService from "../../../services/ItemDataService.js"
    import CharacterGeneratorService from "../../../services/CharacterGeneratorService.js";
    import { flags } from "../../../services/commonConsts.js";

    let { actor, config, onSubmit, onCancel } = $props();
    let layoutMode = $state("double");
    let system = $state(actor.system);
    let characterName = $state(actor.name);
    let characterAge = $state(25);
    let characterWeight = $state(75);
    let characterHeight = $state(175);
    let selectedmetatype = $state("");
    let selectedMagic = $state("");
    let selectedAttribute = $state("");
    let selectedSkill = $state("");
    let selectedResource = $state("");
    let chooseAnOption = localize(config.sheet.chooseanoption);
    let metatypeItem = $state(null);
    let metatypes = $state([]);
    let magics = $state([]);

    onMount(async () => {
        metatypes = ItemDataService.getAllItemsOfType("metatype");

        if (metatypes.length === 0) {
            const humanItem = ItemDataService.getDefaultHumanItem();
            await Item.create(humanItem);
            metatypes = ItemDataService.getAllItemsOfType("metatype");
        }

        magics = ItemDataService.getAllItemsOfType("magic");

        if (magics.length === 0) {
            const magicItem = ItemDataService.getDefaultMagic();
            await Item.create(magicItem);
            magics = ItemDataService.getAllItemsOfType("magic");
        }

        metatypeItem =
            metatypes.find((m) => m.name === "Human") || metatypes[0];
        console.log(
            "Available metatypes:",
            metatypes.map((m) => m.name),
        );
        console.log("Selected default metatype:", metatypeItem?.name);
    });

    const metatypeDropdownOptions = $derived(
        ItemDataService.getAllMetatypes(metatypes),
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
        metatypes[0],
        // svelte-ignore state_referenced_locally
        magics[0],
    );

    console.log("CHARACTER", actor);

    $effect(() => {
        if (selectedmetatype) {
            const foundItem = metatypes.find(
                (i) => i.id === selectedmetatype,
            );
            if (foundItem) {
                metatypeItem = foundItem;
            }
        } else {
            const fallback =
                metatypes.find((m) => m.name === "Human") || metatypes[0];
            if (fallback) {
                metatypeItem = fallback;
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
        selectedmetatype &&
            selectedMagic &&
            selectedAttribute &&
            selectedSkill &&
            selectedResource,
    );

    let ageMin = 0;
    let ageMax = $derived(metatypeItem?.system?.agerange?.max ?? 100);

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
        const m = metatypeDropdownOptions.find(
            (o) => o.foundryitemid === selectedmetatype,
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

        const metatype = metatypes.find((m) => m.id === selectedmetatype);
        const worldmetatype = game.items.get(metatype.id);

        const selectedAttributeObj = attributPointDropdownOptions.find(
            (attr) => attr.priority === selectedAttribute,
        );
        const selectedSkillObj = skillPointDropdownOptions.find(
            (skill) => skill.priority === selectedSkill,
        );

        let initBody =
            metatype.system.modifiers.body < 0
                ? -metatype.system.modifiers.body + 1
                : 1;
        let initStrength =
            metatype.system.modifiers.strength < 0
                ? -metatype.system.modifiers.strength + 1
                : 1;
        let initQuickness =
            metatype.system.modifiers.quickness < 0
                ? -metatype.system.modifiers.quickness + 1
                : 1;
        let initIntelligence =
            metatype.system.modifiers.intelligence < 0
                ? -metatype.system.modifiers.intelligence + 1
                : 1;
        let initWillpower =
            metatype.system.modifiers.willpower < 0
                ? -metatype.system.modifiers.willpower + 1
                : 1;
        let initCharisma =
            metatype.system.modifiers.charisma < 0
                ? -metatype.system.modifiers.charisma + 1
                : 1;

        let initTotal =
            initBody +
            initStrength +
            initQuickness +
            initIntelligence +
            initWillpower +
            initCharisma;

        if (initTotal > selectedAttributeObj.points)
            throw new Error("The metatype has excessive negative modifiers");

        let remainingPoints = selectedAttributeObj.points - initTotal;

        await actor.update({
            "system.profile.age": characterAge,
            "system.profile.height": characterHeight,
            "system.profile.weight": characterWeight,
            "system.creation.attributePoints": remainingPoints,
            "system.creation.activePoints": selectedSkillObj.points,
            "system.attributes.body.value": initBody,
            "system.attributes.quickness.value": initQuickness,
            "system.attributes.strength.value": initStrength,
            "system.attributes.charisma.value": initCharisma,
            "system.attributes.intelligence.value": initIntelligence,
            "system.attributes.willpower.value": initWillpower,
            "system.attributes.body.meta": metatype.system.modifiers.body,
            "system.attributes.quickness.meta":
                metatype.system.modifiers.quickness,
            "system.attributes.strength.meta":
                metatype.system.modifiers.strength,
            "system.attributes.charisma.meta":
                metatype.system.modifiers.charisma,
            "system.attributes.intelligence.meta":
                metatype.system.modifiers.intelligence,
            "system.attributes.willpower.meta":
                metatype.system.modifiers.willpower,
        });

        await actor.createEmbeddedDocuments("Item", [
            worldmetatype.toObject(),
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
                metatypeOptions: metatypeDropdownOptions,
                magicOptions: magicsDropdownOptions,
            });
            metaOpts = metatypeDropdownOptions.filter(
                (i) => i.priority === combo.metatype,
            );
            magicOpts = magicsDropdownOptions.filter(
                (i) => i.priority === combo.magic,
            );
        } while (!metaOpts.length || !magicOpts.length);

        selectedmetatype =
            metaOpts[getRandomIntinRange(0, metaOpts.length - 1)].foundryitemid;
        selectedMagic =
            magicOpts[getRandomIntinRange(0, magicOpts.length - 1)]
                .foundryitemid;

        metatypeItem = metatypes.find((i) => i.id === selectedmetatype);

        const ageSrc =
            metatypeItem.system.agerange ?? metatypeItem.system.lifespan;
        characterAge = getRandomBellCurveWithMode(
            ageSrc.min,
            ageSrc.max,
            ageSrc.average,
        );

        const h = metatypeItem.system.physical.height;
        characterHeight = getRandomBellCurveWithMode(h.min, h.max, h.average);

        const w = metatypeItem.system.physical.weight;
        characterWeight = getRandomBellCurveWithMode(w.min, w.max, w.average);

        selectedAttribute = combo.attribute;
        selectedSkill = combo.skills;
        selectedResource = combo.resources;
    }

    function handleClear() {
        selectedmetatype = "";
        selectedMagic = "";
        selectedAttribute = "";
        selectedSkill = "";
        selectedResource = "";

        characterAge = 25;
        characterHeight = 175;
        characterWeight = 75;

        metatypeItem =
            metatypes.find((m) => m.name === "Human") || metatypes[0];
    }
</script>

<form onsubmit={handleSubmit}>
    <div class="sr3e-waterfall-wrapper">
        <div class={`sr3e-waterfall sr3e-waterfall--${layoutMode}`}>
            <!-- Header -->
            <div class="item-sheet-component">
                <div class="sr3e-inner-background-container">
                    <div class="fake-shadow"></div>
                    <div class="sr3e-inner-background">
                        <div class="image-mask">
                            <img
                                src={metatypeItem?.img ?? ""}
                                role="presentation"
                                data-edit="img"
                                title={metatypeItem?.name ?? ""}
                                alt={metatypeItem?.name ?? ""}
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
                            min={metatypeItem?.system?.agerange?.min ?? 0}
                            max={metatypeItem?.system?.agerange?.max ?? 100}
                            step="1"
                            bind:value={characterAge}
                        />

                        <div for="height-slider">
                            {localize(config.traits.height)}: {characterHeight}
                        </div>
                        <input
                            id="height-slider"
                            type="range"
                            min={metatypeItem?.system?.physical?.height?.min ??
                                0}
                            max={metatypeItem?.system?.physical?.height?.max ??
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
                            min={metatypeItem?.system?.physical?.weight?.min ??
                                0}
                            max={metatypeItem?.system?.physical?.weight?.max ??
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
                                <h3>{localize(config.traits.metaType)}</h3>
                                <select
                                    id="metatype-select"
                                    bind:value={selectedmetatype}
                                >
                                    <option value="" disabled selected hidden
                                        >{chooseAnOption}</option
                                    >
                                    {#each metatypeDropdownOptions as metatype}
                                        <option value={metatype.foundryitemid}>
                                            {metatype.priority}: {metatype.name}
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
                                <h3>
                                    {localize(config.sheet.attributepoints)}
                                </h3>
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
                                            ) &&
                                                skill.priority !==
                                                    selectedSkill}
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
    </div>
</form>
