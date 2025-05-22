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
            key: "min",
            label: localize(common.min),
            value: system.agerange.min,
            type: "number",
        },
        {
            key: "average",
            label: localize(common.average),
            value: system.agerange.average,
            type: "number",
        },
        {
            key: "max",
            label: localize(common.max),
            value: system.agerange.max,
            type: "number",
        },
    ]);

    const height = $derived([
        {
            key: "min",
            label: localize(common.min),
            value: system.physical.height.min,
            type: "number",
        },
        {
            key: "average",
            label: localize(common.average),
            value: system.physical.height.average,
            type: "number",
        },
        {
            key: "max",
            label: localize(common.max),
            value: system.physical.height.max,
            type: "number",
        },
    ]);

    const weight = $derived([
        {
            key: "min",
            label: localize(common.min),
            value: system.physical.weight.min,
            type: "number",
        },
        {
            key: "average",
            label: localize(common.average),
            value: system.physical.weight.average,
            type: "number",
        },
        {
            key: "max",
            label: localize(common.max),
            value: system.physical.weight.max,
            type: "number",
        },
    ]);

    const movement = $derived([
        {
            key: "base",
            label: localize(movementConfig.walking),
            value: system.movement.base,
            type: "number",
        },
        {
            key: "modifier",
            label: localize(movementConfig.runSpeedModifier),
            value: system.movement.modifier,
            type: "number",
        },
    ]);

    const karma = $derived([
        {
            key: "factor",
            label: localize(karmaConfig.advancementRatio),
            value: system.karma.factor,
            type: "number",
        },
    ]);

    const attributeModifiers = $derived([
        {
            key: "strength",
            label: localize(attributes.strength),
            value: system.modifiers.strength,
            type: "number",
        },
        {
            key: "quickness",
            label: localize(attributes.quickness),
            value: system.modifiers.quickness,
            type: "number",
        },
        {
            key: "body",
            label: localize(attributes.body),
            value: system.modifiers.body,
            type: "number",
        },
        {
            key: "charisma",
            label: localize(attributes.charisma),
            value: system.modifiers.charisma,
            type: "number",
        },
        {
            key: "intelligence",
            label: localize(attributes.intelligence),
            value: system.modifiers.intelligence,
            type: "number",
        },
        {
            key: "willpower",
            label: localize(attributes.willpower),
            value: system.modifiers.willpower,
            type: "number",
        },
    ]);

    const attributeLimits = $derived([
        {
            key: "strength",
            label: localize(attributes.strength),
            value: system.attributeLimits.strength,
            type: "number",
        },
        {
            key: "quickness",
            label: localize(attributes.quickness),
            value: system.attributeLimits.quickness,
            type: "number",
        },
        {
            key: "body",
            label: localize(attributes.body),
            value: system.attributeLimits.body,
            type: "number",
        },
        {
            key: "charisma",
            label: localize(attributes.charisma),
            value: system.attributeLimits.charisma,
            type: "number",
        },
        {
            key: "intelligence",
            label: localize(attributes.intelligence),
            value: system.attributeLimits.intelligence,
            type: "number",
        },
        {
            key: "willpower",
            label: localize(attributes.willpower),
            value: system.attributeLimits.willpower,
            type: "number",
        },
    ]);

    const vision = $derived([
        {
            key: "type",
            label: localize(visionConfig.type),
            value: system.vision.type,
            type: "select",
        },
    ]);

    const priorityEntry = $derived({
        key: "priority",
        label: "Select Priority",
        value: system.priority,
        type: "select",
    });

    const visionOptions = [
        localize(visionConfig.normalvision),
        localize(visionConfig.lowlight),
        localize(visionConfig.thermographic),
    ];

    const priorityOptions = ["C", "D", "E"];
</script>

<div class="meta-human-grid">
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
                <StatCard
                    {item}
                    entry={priorityEntry}
                    path="system"
                    type={priorityEntry.type}
                    options={priorityOptions}
                />
            </div>
        </div>
    </div>

    <!-- Age Range -->
    <div class="item-sheet-component">
        <div class="sr3e-inner-background-container">
            <div class="fake-shadow"></div>
            <div class="sr3e-inner-background">
                <h3 class="item">{localize(traits.agerange)}</h3>
                <div class="stat-grid">
                    {#each agerange as entry}
                        <StatCard
                            {item}
                            {entry}
                            path="system.agerange"
                            type={entry.type}
                        />
                    {/each}
                </div>
            </div>
        </div>
    </div>

    <!-- Height -->
    <div class="item-sheet-component">
        <div class="sr3e-inner-background-container">
            <div class="fake-shadow"></div>
            <div class="sr3e-inner-background">
                <h3 class="item">{localize(traits.height)}</h3>
                <div class="stat-grid">
                    {#each height as entry}
                        <StatCard
                            {item}
                            {entry}
                            path="system.physical.height"
                            type={entry.type}
                        />
                    {/each}
                </div>
            </div>
        </div>
    </div>

    <!-- Weight -->
    <div class="item-sheet-component">
        <div class="sr3e-inner-background-container">
            <div class="fake-shadow"></div>
            <div class="sr3e-inner-background">
                <h3 class="item">{localize(traits.weight)}</h3>
                <div class="stat-grid">
                    {#each weight as entry}
                        <StatCard
                            {item}
                            {entry}
                            path="system.physical.weight"
                            type={entry.type}
                        />
                    {/each}
                </div>
            </div>
        </div>
    </div>

    <!-- Modifiers -->
    <div class="item-sheet-component">
        <div class="sr3e-inner-background-container">
            <div class="fake-shadow"></div>
            <div class="sr3e-inner-background">
                <h3 class="item">{localize(attributes.modifiers)}</h3>
                <div class="stat-grid">
                    {#each attributeModifiers as entry}
                        <StatCard
                            {item}
                            {entry}
                            path="system.modifiers"
                            type={entry.type}
                        />
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
                        <StatCard
                            {item}
                            {entry}
                            path="system.attributeLimits"
                            type={entry.type}
                        />
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
                        <StatCard
                            {item}
                            {entry}
                            path="system.movement"
                            type={entry.type}
                        />
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
                        <StatCard
                            {item}
                            {entry}
                            path="system.karma"
                            type={entry.type}
                        />
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
                        <StatCard
                            {item}
                            {entry}
                            path="system.vision"
                            type={entry.type}
                            options={visionOptions}
                        />
                    {/each}
            </div>
        </div>

        <div class="item-sheet-component">
            <div class="sr3e-inner-background-container">
                <div class="fake-shadow"></div>
                <div class="sr3e-inner-background">
                    <JournalViewer {item} {config} />
                </div>
            </div>
        </div>
    </div>
</div>
