<script>
    import { localize } from "../../foundry/SvelteHelpers.js";
    import { openFilePicker } from "../../foundry/SvelteHelpers.js";
    import Editor from "./components/Editor.svelte";

    export let item = {};
    export let config = {};

    let system = item.system;

    let attributes = config.attributes;
    let common = config.common;
    let movement = config.movement;
    let karma = config.karma;
    let vision = config.vision;
    let traits = config.traits;

    $: metahuman = system;

    $: movement = [
        {
            label: localize(movement.walking),
            value: metahuman.movement.base,
        },
        {
            label: localize(movement.runSpeedModifier),
            value: metahuman.movement.modifier,
        },
    ];

    $: karma = [
        {
            label: localize(karma.advancementRatio),
            value: metahuman.karma.factor,
        },
    ];

    $: agerange = [
        {
            label: localize(common.min),
            value: metahuman.agerange.min,
        },
        {
            label: localize(common.average),
            value: metahuman.agerange.average,
        },
        {
            label: localize(common.max),
            value: metahuman.agerange.max,
        },
    ];

    $: height = [
        {
            label: localize(common.min),
            value: metahuman.physical.height.min,
        },
        {
            label: localize(common.average),
            value: metahuman.physical.height.average,
        },
        {
            label: localize(common.max),
            value: metahuman.physical.height.max,
        },
    ];

    $: weight = [
        {
            label: localize(common.min),
            value: metahuman.physical.weight.min,
        },
        {
            label: localize(common.average),
            value: metahuman.physical.weight.average,
        },
        {
            label: localize(common.max),
            value: metahuman.physical.weight.max,
        },
    ];

    $: attributeModifiers = [
        {
            label: localize(attributes.strength),
            value: metahuman.modifiers.strength,
        },
        {
            label: localize(attributes.quickness),
            value: metahuman.modifiers.quickness,
        },
        {
            label: localize(attributes.body),
            value: metahuman.modifiers.body,
        },
        {
            label: localize(attributes.charisma),
            value: metahuman.modifiers.charisma,
        },
        {
            label: localize(attributes.intelligence),
            value: metahuman.modifiers.intelligence,
        },
        {
            label: localize(attributes.willpower),
            value: metahuman.modifiers.willpower,
        },
    ];

    $: attributeLimits = [
        {
            label: localize(attributes.strength),
            value: metahuman.attributeLimits.strength,
        },
        {
            label: localize(attributes.quickness),
            value: metahuman.attributeLimits.quickness,
        },
        {
            label: localize(attributes.body),
            value: metahuman.attributeLimits.body,
        },
        {
            label: localize(attributes.charisma),
            value: metahuman.attributeLimits.charisma,
        },
        {
            label: localize(attributes.intelligence),
            value: metahuman.attributeLimits.intelligence,
        },
        {
            label: localize(attributes.willpower),
            value: metahuman.attributeLimits.willpower,
        },
    ];

    $: vision = [
        {
            label: localize(vision.type),
            value: metahuman.vision.type,
        },
        {
            label: localize(vision.description),
            value: metahuman.vision.description,
        },
        {
            label: localize(vision.rules),
            value: metahuman.vision.rules,
        },
    ];
</script>

<div class="sr3e">
    <div class="item-sheet-component">
        <div class="inner-background-container">
            <div class="fake-shadow"></div>
            <div class="inner-background">
                <div class="image-mask">
                    <img
                        src={item.img}
                        data-edit="img"
                        title={item.name}
                        role="presentation"
                        alt={item.name}
                        on:click={openFilePicker(item)}
                    />
                </div>

                <!-- svelte-ignore a11y_missing_content -->

                <input
                    class="large"
                    name="name"
                    type="text"
                    bind:value={item.name}
                    on:change={(e) =>
                        item.update({
                            name: e.target.value,
                        })}
                />
                <div class="stat-card">
                    <div>
                        <h4>Select Priority</h4>
                    </div>
                    <div class="stat-label">
                        <select
                            name="system.priority"
                            class="priority-select"
                            bind:value={system.priority}
                            on:change={(e) =>
                                item.update({
                                    "system.priority": e.target.value,
                                })}
                        >
                            {#each ["C", "D", "E"] as priority}
                                <option value={priority}>{priority}</option>
                            {/each}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Age Range Div -->
    <div class="item-sheet-component">
        <div class="inner-background-container">
            <div class="fake-shadow"></div>
            <div class="inner-background">
                <h3 class="item">{localize(traits.agerange)}</h3>
                <div class="stat-grid">
                    {#each agerange as entry}
                        <div class="stat-card">
                            <div>
                                <h4 class="no-margin">{entry.label}</h4>
                            </div>
                            <div class="stat-label">
                                <!-- Hidden input to store the value for form submission -->
                                <input type="number" value={entry.value} />
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    </div>

    <!-- Height Attributes Div -->
    <div class="item-sheet-component">
        <div class="inner-background-container">
            <div class="fake-shadow"></div>
            <div class="inner-background">
                <h3 class="item">{localize(traits.height)}</h3>
                <div class="stat-grid">
                    {#each height as entry}
                        <div class="stat-card">
                            <div>
                                <h4 class="no-margin">{entry.label}</h4>
                            </div>
                            <div class="stat-label">
                                <!-- Hidden input -->
                                <input type="number" value={entry.value} />
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    </div>

    <!-- Weight Attributes Div -->
    <div class="item-sheet-component">
        <div class="inner-background-container">
            <div class="fake-shadow"></div>
            <div class="inner-background">
                <h3 class="item">{localize(traits.weight)}</h3>
                <div class="stat-grid">
                    {#each weight as entry}
                        <div class="stat-card">
                            <div>
                                <h4 class="no-margin">{entry.label}</h4>
                            </div>
                            <div class="stat-label">
                                <!-- Hidden input -->
                                <input type="number" value={entry.value} />
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    </div>

    <!-- Modifiers Div -->
    <div class="item-sheet-component">
        <div class="inner-background-container">
            <div class="fake-shadow"></div>
            <div class="inner-background">
                <h3 class="item">
                    {localize(attributes.modifiers)}
                </h3>
                <div class="grid-container">
                    <div class="stat-grid">
                        {#each attributeModifiers as entry}
                            <div class="stat-card">
                                <div>
                                    <h4 class="no-margin">
                                        {entry.label}
                                    </h4>
                                </div>
                                <div class="stat-label">
                                    <!-- Hidden input -->
                                    <input type="number" value={entry.value} />
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Attribute Limits Div -->
    <div class="item-sheet-component">
        <div class="inner-background-container">
            <div class="fake-shadow"></div>
            <div class="inner-background">
                <h3 class="item">{localize(attributes.limits)}</h3>
                <div class="stat-grid">
                    {#each attributeLimits as entry}
                        <div class="stat-card">
                            <div>
                                <h4 class="no-margin">{entry.label}</h4>
                            </div>
                            <div class="stat-label">
                                <input type="number" value={entry.value} />
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    </div>

    <!-- Movement Div -->
    <div class="item-sheet-component">
        <div class="inner-background-container slim">
            <div class="fake-shadow"></div>
            <div class="inner-background">
                <h3 class="item">{localize(config.movement.movement)}</h3>
                <div class="stat-grid two-column">
                    {#each movement as entry}
                        <div class="stat-card">
                            <div>
                                <h4 class="no-margin">{entry.label}</h4>
                            </div>
                            <div class="stat-label">
                                <!-- Hidden input to store the value for form submission -->
                                <input type="number" value={entry.value} />
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    </div>

    <!-- Karma Div -->
    <div class="item-sheet-component">
        <div class="inner-background-container slim">
            <div class="fake-shadow"></div>
            <div class="inner-background slim">
                <h3 class="item">{localize(config.karma.karma)}</h3>
                <div class="stat-grid one-column">
                    {#each karma as entry}
                        <div class="stat-card">
                            <div>
                                <h4 class="no-margin">{entry.label}</h4>
                            </div>
                            <div class="stat-label">
                                <!-- Hidden input to store the value for form submission -->
                                <input type="number" value={entry.value} />
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    </div>

    <!-- Karma Div -->
    <div class="item-sheet-component">
        <div class="inner-background-container">
            <div class="fake-shadow"></div>
            <div class="inner-background">
                <h3 class="item">{localize(config.vision.vision)}</h3>
                <div class="stat-grid one-column">
                    {#each vision as entry}
                        <div class="stat-card">
                            <div>
                                <h4 class="no-margin">{entry.label}</h4>
                            </div>
                            <div class="stat-label">
                                <input type="text" value={entry.value} />
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    </div>

    <div class="item-sheet-component">
        <div class="inner-background-container">
            <div class="fake-shadow"></div>
            <Editor document={item} editable={true} owner={item.isOwner} />
        </div>
    </div>
</div>
