<script>
    import { onMount } from "svelte";
    import { localize, openFilePicker, getRandomIntinRange } from "../../../svelteHelpers";
    import ActorDataService from "../../../foundry/services/ActorDataService.js";
    import ItemDataService from "../../../foundry/services/ItemDataService.js";
    import CharacterGeneratorService from "../../../foundry/services/CharacterGeneratorService.js";

    let { actor, config, onSubmit, onCancel } = $props();
    let system = $state(actor.system);
    let characterName = $state(actor.name);
    let characterAge = $state(25);
    let characterWeight = $state(75);
    let characterheight = $state(175);

    $effect(() => {
        if (actor && characterName !== actor.name) {
            actor.name = characterName;
            if (characterName.length > 0) {
                actor.update({ name: characterName });
            }
        }
    });

    console.log("The svelte component has been initiated");

    let metahumans = ItemDataService.getMetahumanDropdownOptions();
    let magics = ItemDataService.getMagicDropdownOptions();
    let attributePointCollection = ActorDataService.getCharacterCreationStats();

    let priority = CharacterGeneratorService.generatePriorityCombination(metahumans[0], magics[0]);

    let currentMetahuman = metahumans[getRandomIntinRange(0, metahumans.length -1)];

    console.log(config.traits.age);
    console.log(config.traits.age);
    console.log(config.traits.age);
    console.log(config.traits.age);
    console.log(config.traits.age);
    console.log(config.traits.age);
    console.log(config.traits.age);
    console.log(config.traits.age);

    function handleSubmit() {
        console.log("Character creation submitted:", characterName);
        onSubmit?.(true);
    }

    function handleCancel() {
        console.log("Character creation cancelled");
        onCancel?.();
    }
</script>

<form onsubmit={handleSubmit}>
    <label for="age-slider">{localize(config.traits.age)}: {characterAge}</label
    >
    <input
        id="age-slider"
        type="range"
        min="0"
        max="100"
        step="1"
        bind:value={characterAge}
    />

    <label for="weight-slider">{localize(config.traits.weight)}: {characterWeight}</label>
    <input
        id="age-slider"
        type="range"
        min="0"
        max="100"
        step="1"
        bind:value={characterWeight}
    />

    <div class="form-group">
        <label for="character-name">Character Name</label>
        <input
            id="character-name"
            type="text"
            bind:value={characterName}
            placeholder="Enter character name"
        />
    </div>

    <p><strong>Actor ID:</strong> {actor?.id || "N/A"}</p>
    <p><strong>Actor Type:</strong> {actor?.type || "N/A"}</p>

    <div class="form-group">
        <button type="submit">Create Character</button>
        <button type="button" onclick={handleCancel}>Cancel</button>
    </div>
</form>
