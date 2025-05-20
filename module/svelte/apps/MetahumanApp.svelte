<script>
    import { localize, openFilePicker } from "../../svelteHelpers.js";
    import Editor from "./components/Editor.svelte";

    let { item = {}, config = {} } = $props();

    const system = $state(item.system);

    const attributes = config.attributes;
    const common = config.common;
    const movementConfig = config.movement;
    const karmaConfig = config.karma;
    const visionConfig = config.vision;
    const traits = config.traits;

    const movement = $derived([
        {
            label: localize(movementConfig.walking),
            value: system.movement.base,
        },
        {
            label: localize(movementConfig.runSpeedModifier),
            value: system.movement.modifier,
        },
    ]);

    const karma = $derived([
        {
            label: localize(karmaConfig.advancementRatio),
            value: system.karma.factor,
        },
    ]);

    const agerange = $derived([
        {
            label: localize(common.min),
            value: system.agerange.min,
        },
        {
            label: localize(common.average),
            value: system.agerange.average,
        },
        {
            label: localize(common.max),
            value: system.agerange.max,
        },
    ]);

    const height = $derived([
        {
            label: localize(common.min),
            value: system.physical.height.min,
        },

        {
            label: localize(common.average),
            value: system.physical.height.average,
        },
        {
            label: localize(common.max),
            value: system.physical.height.max,
        },
    ]);

    const weight = $derived([
        {
            label: localize(common.min),
            value: system.physical.weight.min,
        },
        {
            label: localize(common.average),
            value: system.physical.weight.average,
        },
        {
            label: localize(common.max),
            value: system.physical.weight.max,
        },
    ]);

    const attributeModifiers = $derived([
        {
            label: localize(attributes.strength),
            value: system.modifiers.strength,
        },
        {
            label: localize(attributes.quickness),
            value: system.modifiers.quickness,
        },
        {
            label: localize(attributes.body),
            value: system.modifiers.body,
        },
        {
            label: localize(attributes.charisma),
            value: system.modifiers.charisma,
        },
        {
            label: localize(attributes.intelligence),
            value: system.modifiers.intelligence,
        },
        {
            label: localize(attributes.willpower),
            value: system.modifiers.willpower,
        },
    ]);

    const attributeLimits = $derived([
        {
            label: localize(attributes.strength),
            value: system.attributeLimits.strength,
        },
        {
            label: localize(attributes.quickness),
            value: system.attributeLimits.quickness,
        },
        {
            label: localize(attributes.body),
            value: system.attributeLimits.body,
        },
        {
            label: localize(attributes.charisma),
            value: system.attributeLimits.charisma,
        },
        {
            label: localize(attributes.intelligence),
            value: system.attributeLimits.intelligence,
        },
        {
            label: localize(attributes.willpower),
            value: system.attributeLimits.willpower,
        },
    ]);

    const vision = $derived([
        {
            label: localize(visionConfig.type),
            value: system.vision.type,
        },
        {
            label: localize(visionConfig.description),
            value: system.vision.description,
        },
        {
            label: localize(visionConfig.rules),
            value: system.vision.rules,
        },
    ]);
</script>

<div class="meta-human-grid">
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
                    onchange={(e) =>
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
                            onchange={(e) =>
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
        <div class="sr3e-inner-background-container">
            <div class="fake-shadow"></div>
            <div class="sr3e-inner-background">
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
        <div class="sr3e-inner-background-container">
            <div class="fake-shadow"></div>
            <div class="sr3e-inner-background">
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
        <div class="sr3e-inner-background-container">
            <div class="fake-shadow"></div>
            <div class="sr3e-inner-background">
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
        <div class="sr3e-inner-background-container">
            <div class="fake-shadow"></div>
            <div class="sr3e-inner-background">
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
        <div class="sr3e-inner-background-container">
            <div class="fake-shadow"></div>
            <div class="sr3e-inner-background">
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
        <div class="sr3e-inner-background-container slim">
            <div class="fake-shadow"></div>
            <div class="sr3e-inner-background">
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
        <div class="sr3e-inner-background-container slim">
            <div class="fake-shadow"></div>
            <div class="sr3e-inner-background slim">
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
        <div class="sr3e-inner-background-container">
            <div class="fake-shadow"></div>
            <div class="sr3e-inner-background">
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
    <!--
    <div class="item-sheet-component">
        <div class="sr3e-inner-background-container">
            <div class="fake-shadow"></div>
            <Editor item />
        </div>
    </div>
    -->
</div>
