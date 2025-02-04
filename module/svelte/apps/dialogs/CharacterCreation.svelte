<script>
    import { onMount } from "svelte";
    import { openFilePicker } from "../../../foundry/SvelteHelpers";
    import ItemDataService from "../../../foundry/services/ItemDataService.js";
    export let resolve = {};
    export let actor = {};

    let metahumanImg = "";

    let metahumans = [];
    let magics = [];
    let attributePointCollection = [
        { priority: "A", points: 30 },
        { priority: "B", points: 27 },
        { priority: "C", points: 24 },
        { priority: "D", points: 21 },
        { priority: "E", points: 18 },
    ];
    let skillPointCollection = [
        { priority: "A", points: 50 },
        { priority: "B", points: 40 },
        { priority: "C", points: 34 },
        { priority: "D", points: 30 },
        { priority: "E", points: 27 },
    ];
    let assets = [
        { priority: "A", points: 1000000 },
        { priority: "B", points: 400000 },
        { priority: "C", points: 90000 },
        { priority: "D", points: 20000 },
        { priority: "E", points: 5000 },
    ];

    let img = "";
    $: actor = actor;
    $: age = actor.system.profile.age;

    $: ageMin = 0;
    $: ageMax = 100;

    $: height = actor.system.profile.height;
    $: heightMin = 70;
    $: heightMax = 220;

    $: weight = actor.system.profile.weight;
    $: weightMin = 30;
    $: weightMax = 250;

    let metahumanSelection = "";
    let magicSelection = "";
    let attributePoints = 0;
    let skillPoints = 0;
    let nuyen = 0;

    onMount(async () => {
        metahumans = game.items.filter((item) => item.type === "metahuman");

        if (metahumans.length === 0) {
            const humanItem = ItemDataService.getDefaultHumanItem();
            Item.create(humanItem);
            metahumans = game.items.filter((item) => item.type === "metahuman");
        }

        magics = game.items.filter((item) => item.type === "magic");

        if (magics.length === 0) {
            const magicItem = ItemDataService.getDefaultMagic();
            Item.create(magicItem);
            magics = game.items.filter((item) => item.type === "magic");
        }

        metahumanImg = metahumans.find(
            (item) => item.name.toLowerCase() === "human",
        )?.img;
        img = actor.img;
    });

    function confirm() {
        resolve(true);
    }

    function cancel() {
        resolve(false);
    }

    function currency(number) {
        return `¥${number.toLocaleString()}`;
    }
</script>

<div class="meta-human-grid">
    <div class="item-sheet-component">
        <div class="inner-background-container">
            <div class="fake-shadow"></div>
            <div class="inner-background">
                <div class="image-mask">
                    <img
                        src={img}
                        data-edit="img"
                        title={actor.name}
                        role="presentation"
                        alt={actor.name}
                        on:click={async () => {
                            const path = await openFilePicker(actor);
                            img = path;
                        }}
                    />
                </div>
                <input
                    class="large"
                    name="name"
                    type="text"
                    bind:value={actor.name}
                    on:change={(e) => actor.update({ name: e.target.value })}
                    on:keydown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            e.stopPropagation();
                            actor.update({ name: e.target.value });
                        }
                    }}
                />
            </div>
        </div>
    </div>

    <div class="item-sheet-component">
        <div class="inner-background-container">
            <div class="fake-shadow"></div>
            <div class="inner-background">
                <div class="image-mask">
                    <img
                        src={metahumanImg}
                        data-edit="img"
                        title={actor.name}
                        role="presentation"
                        alt={actor.name}
                    />
                </div>
                <div>
                    <h1>Placeholder</h1>
                </div>
            </div>
        </div>
    </div>

    <div class="item-sheet-component">
        <div class="inner-background-container">
            <div class="fake-shadow"></div>
            <div class="inner-background">
                <h1>Sliders</h1>
                <h3>Age: {age}</h3>
                <input
                    type="range"
                    bind:value={age}
                    min={ageMin}
                    max={ageMax}
                    step="1"
                />

                <h3>Height: {height}</h3>
                <input
                    type="range"
                    bind:value={height}
                    min={heightMin}
                    max={heightMax}
                    step="1"
                />

                <h3>Weight: {weight}</h3>
                <input
                    type="range"
                    bind:value={weight}
                    min={weightMin}
                    max={weightMax}
                    step="1"
                />
            </div>
        </div>
    </div>

    <div class="item-sheet-component">
        <div class="inner-background-container">
            <div class="fake-shadow"></div>
            <div class="inner-background">
                <h1>Multi Selections</h1>
                <select
                    id="metahuman"
                    bind:value={metahumanSelection}
                    on:change={(e) =>
                        (metahumanImg = game.items.contents.find(
                            (item) => item.type === e.target.value,
                        ).img)}
                >
                <option selected value={""}>
                    Localize Select
                </option>
                    {#each metahumans as metahuman}
                        <option value={metahuman.id}
                            >{metahuman.name} {metahuman.system.priority}
                        </option>
                    {/each}
                </select>

                <select id="magic" bind:value={magicSelection}>
                    <option selected value={""}>
                        Localize Select
                    </option>
                    {#each magics as magic}
                        <option value={magic.id}
                            >{magic.name} {magic.system.priority}</option
                        >
                    {/each}
                </select>

                <select id="attributePoints" bind:value={attributePoints}>
                    <option selected value={0}>
                        Localize Select
                    </option>
                    {#each attributePointCollection as attribute}
                        <option value={attribute.points}
                            >{attribute.points} {attribute.priority}</option
                        >
                    {/each}
                </select>

                <select id="skillPoints" bind:value={skillPoints}>
                    <option selected value={0}>
                        Localize Select
                    </option>
                    {#each skillPointCollection as skill}
                        <option value={skill.points}
                            >{skill.points} {skill.priority}</option
                        >
                    {/each}
                </select>

                <select id="nuyen" bind:value={nuyen}>
                    <option selected value={0}>
                        Localize Select
                    </option>
                    {#each assets as asset}
                        <option value={asset.points}
                            >{currency(asset.points)} {asset.priority}</option
                        >
                    {/each}
                </select>
            </div>
        </div>
    </div>

    <div class="item-sheet-component">
        <div class="inner-background-container">
            <div class="fake-shadow"></div>
            <div class="inner-background">
                <h1>Randomize</h1>
            </div>
        </div>
    </div>

    <div class="item-sheet-component">
        <div class="inner-background-container">
            <div class="fake-shadow"></div>
            <div class="inner-background">
                <h1>Randomize</h1>
            </div>
        </div>
    </div>

    <div class="item-sheet-component">
        <div class="inner-background-container">
            <div class="fake-shadow"></div>
            <div class="inner-background">
                <h1>Buttons</h1>
                <div class="stat-grid">
                    <button class="my-button" aria-label="Random"><span><i class="fa-solid fa-shuffle"></i></span></button>
                    <button class="my-button" aria-label="Mix"><span><i class="fa-solid fa-rotate-right"></i></span></button>
                    <button class="my-button">Ok</button>
                    <button class="my-button">Cancel</button>
                </div>
            </div>
        </div>
    </div>
</div>
