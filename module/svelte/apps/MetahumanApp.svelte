<script>
    import { localize, openFilePicker } from "../../svelteHelpers.js";
    import JournalViewer from "./components/JournalViewer.svelte";
    import StatCard from "./components/StatCard.svelte";

    let { item = {}, config = {} } = $props();

    const system = $state(item.system);

    const attributes = config.attributes;
    const common = config.common;
    const movementConfig = config.movement;
    const karmaConfig = config.karma;
    const visionConfig = config.vision;
    const traits = config.traits;

    const agerange = $derived([
        {
            item,
            key: "min",
            label: localize(common.min),
            value: system.agerange.min,
            path: "system.agerange",
            type: "number",
            options: []
        },
        {
            item,
            key: "average",
            label: localize(common.average),
            value: system.agerange.average,
            path: "system.agerange",
            type: "number",
            options: []
        },
        {
            item,
            key: "max",
            label: localize(common.max),
            value: system.agerange.max,
            path: "system.agerange",
            type: "number",
            options: []
        },
    ]);

    const height = $derived([
        {
            item,
            key: "min",
            label: localize(common.min),
            value: system.physical.height.min,
            path: "system.physical.height",
            type: "number",
            options: []
        },
        {
            item,
            key: "average",
            label: localize(common.average),
            value: system.physical.height.average,
            path: "system.physical.height",
            type: "number",
            options: []
        },
        {
            item,
            key: "max",
            label: localize(common.max),
            value: system.physical.height.max,
            path: "system.physical.height",
            type: "number",
            options: []
        },
    ]);

    const weight = $derived([
        {
            item,
            key: "min",
            label: localize(common.min),
            value: system.physical.weight.min,
            path: "system.physical.weight",
            type: "number",
            options: []
        },
        {
            item,
            key: "average",
            label: localize(common.average),
            value: system.physical.weight.average,
            path: "system.physical.weight",
            type: "number",
            options: []
        },
        {
            item,
            key: "max",
            label: localize(common.max),
            value: system.physical.weight.max,
            path: "system.physical.weight",
            type: "number",
            options: []
        },
    ]);

    const movement = $derived([
        {
            item,
            key: "base",
            label: localize(movementConfig.walking),
            value: system.movement.base,
            path: "system.movement",
            type: "number",
            options: []
        },
        {
            item,
            key: "modifier",
            label: localize(movementConfig.runSpeedModifier),
            value: system.movement.modifier,
            path: "system.movement",
            type: "number",
            options: []
        },
    ]);

    const karma = $derived([
        {
            item,
            key: "factor",
            label: localize(karmaConfig.advancementRatio),
            value: system.karma.factor,
            path: "system.karma",
            type: "number",
            options: []
        },
    ]);

    const attributeModifiers = $derived([
        {
            item,
            key: "strength",
            label: localize(attributes.strength),
            value: system.modifiers.strength,
            path: "system.modifiers",
            type: "number",
            options: []
        },
        {
            item,
            key: "quickness",
            label: localize(attributes.quickness),
            value: system.modifiers.quickness,
            path: "system.modifiers",
            type: "number",
            options: []
        },
        {
            item,
            key: "body",
            label: localize(attributes.body),
            value: system.modifiers.body,
            path: "system.modifiers",
            type: "number",
            options: []
        },
        {
            item,
            key: "charisma",
            label: localize(attributes.charisma),
            value: system.modifiers.charisma,
            path: "system.modifiers",
            type: "number",
            options: []
        },
        {
            item,
            key: "intelligence",
            label: localize(attributes.intelligence),
            value: system.modifiers.intelligence,
            path: "system.modifiers",
            type: "number",
            options: []
        },
        {
            item,
            key: "willpower",
            label: localize(attributes.willpower),
            value: system.modifiers.willpower,
            path: "system.modifiers",
            type: "number",
            options: []
        },
    ]);

    const attributeLimits = $derived([
        {
            item,
            key: "strength",
            label: localize(attributes.strength),
            value: system.attributeLimits.strength,
            path: "system.attributeLimits",
            type: "number",
            options: []
        },
        {
            item,
            key: "quickness",
            label: localize(attributes.quickness),
            value: system.attributeLimits.quickness,
            path: "system.attributeLimits",
            type: "number",
            options: []
        },
        {
            item,
            key: "body",
            label: localize(attributes.body),
            value: system.attributeLimits.body,
            path: "system.attributeLimits",
            type: "number",
            options: []
        },
        {
            item,
            key: "charisma",
            label: localize(attributes.charisma),
            value: system.attributeLimits.charisma,
            path: "system.attributeLimits",
            type: "number",
            options: []
        },
        {
            item,
            key: "intelligence",
            label: localize(attributes.intelligence),
            value: system.attributeLimits.intelligence,
            path: "system.attributeLimits",
            type: "number",
            options: []
        },
        {
            item,
            key: "willpower",
            label: localize(attributes.willpower),
            value: system.attributeLimits.willpower,
            path: "system.attributeLimits",
            type: "number",
            options: []
        },
    ]);

    const vision = $derived([
        {
            item,
            key: "type",
            label: localize(visionConfig.type),
            value: system.vision.type,
            path: "system.vision",
            type: "select",
            options: [
                localize(visionConfig.normalvision),
                localize(visionConfig.lowlight),
                localize(visionConfig.thermographic),
            ],
        },
    ]);

    const priorityEntry = $derived({
        item,
        key: "priority",
        label: "Select Priority",
        value: system.priority,
        path: "system",
        type: "select",
        options: ["C", "D", "E"],
    });
</script>
<div class="sr3e-item-grid">
    <!-- Name and Priority -->
    <div class="item-sheet-component">
        <div class="sr3e-inner-background-container">
            <div class="fake-shadow"></div>
            <div class="sr3e-inner-background">
                <div class="image-mask">
                    <img
                        src={item.img}
                        data-edit="img"
                        title={item.name}
                        role="presentation"
                        alt={item.name}
                        onclick={openFilePicker(item)}
                    />
                </div>
                <input
                    class="large"
                    name="name"
                    type="text"
                    bind:value={item.name}
                    onchange={(e) => item.update({ name: e.target.value })}
                />
                <StatCard {...priorityEntry} />
            </div>
        </div>
    </div>

    <!-- Age Range -->
    {#if agerange}
    <div class="item-sheet-component">
        <div class="sr3e-inner-background-container">
            <div class="fake-shadow"></div>
            <div class="sr3e-inner-background">
                <h3 class="item">{localize(traits.agerange)}</h3>
                <div class="stat-grid">
                    {#each agerange as entry}
                        <StatCard {...entry} />
                    {/each}
                </div>
            </div>
        </div>
    </div>
    {/if}

    <!-- Height -->
    {#if height}
    <div class="item-sheet-component">
        <div class="sr3e-inner-background-container">
            <div class="fake-shadow"></div>
            <div class="sr3e-inner-background">
                <h3 class="item">{localize(traits.height)}</h3>
                <div class="stat-grid">
                    {#each height as entry}
                        <StatCard {...entry} />
                    {/each}
                </div>
            </div>
        </div>
    </div>
    {/if}

    <!-- Weight -->
    {#if weight}
    <div class="item-sheet-component">
        <div class="sr3e-inner-background-container">
            <div class="fake-shadow"></div>
            <div class="sr3e-inner-background">
                <h3 class="item">{localize(traits.weight)}</h3>
                <div class="stat-grid">
                    {#each weight as entry}
                        <StatCard {...entry} />
                    {/each}
                </div>
            </div>
        </div>
    </div>
    {/if}

    <!-- Modifiers -->
    <div class="item-sheet-component">
        <div class="sr3e-inner-background-container">
            <div class="fake-shadow"></div>
            <div class="sr3e-inner-background">
                <h3 class="item">{localize(attributes.modifiers)}</h3>
                <div class="stat-grid">
                    {#each attributeModifiers as entry}
                        <StatCard {...entry} />
                    {/each}
                </div>
            </div>
        </div>
    </div>

    <!-- Attribute Limits -->
    <div class="item-sheet-component">
        <div class="sr3e-inner-background-container">
            <div class="fake-shadow"></div>
            <div class="sr3e-inner-background">
                <h3 class="item">{localize(attributes.limits)}</h3>
                <div class="stat-grid">
                    {#each attributeLimits as entry}
                        <StatCard {...entry} />
                    {/each}
                </div>
            </div>
        </div>
    </div>

    <!-- Movement -->
    <div class="item-sheet-component">
        <div class="sr3e-inner-background-container slim">
            <div class="fake-shadow"></div>
            <div class="sr3e-inner-background">
                <h3 class="item">{localize(config.movement.movement)}</h3>
                <div class="stat-grid two-column">
                    {#each movement as entry}
                        <StatCard {...entry} />
                    {/each}
                </div>
            </div>
        </div>
    </div>

    <!-- Karma -->
    <div class="item-sheet-component">
        <div class="sr3e-inner-background-container slim">
            <div class="fake-shadow"></div>
            <div class="sr3e-inner-background slim">
                <h3 class="item">{localize(config.karma.karma)}</h3>
                <div class="stat-grid one-column">
                    {#each karma as entry}
                        <StatCard {...entry} />
                    {/each}
                </div>
            </div>
        </div>
    </div>

    <!-- Vision -->
    <div class="item-sheet-component">
        <div class="sr3e-inner-background-container">
            <div class="fake-shadow"></div>
            <div class="sr3e-inner-background">
                <h3 class="item">{localize(config.vision.vision)}</h3>
                {#each vision as entry}
                    <StatCard {...entry} />
                {/each}
            </div>
        </div>
    </div>

    <!-- Journal Viewer -->
    <div class="item-sheet-component">
        <div class="sr3e-inner-background-container">
            <div class="fake-shadow"></div>
            <div class="sr3e-inner-background">
                <JournalViewer {item} {config} />
            </div>
        </div>
    </div>
</div>