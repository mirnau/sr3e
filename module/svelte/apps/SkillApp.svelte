<script>
    import { localize, openFilePicker } from "../../svelteHelpers.js";
    import ActorDataService from "../../foundry/services/ActorDataService.js";
    import JournalViewer from "./components/JournalViewer.svelte";

    let { item, config, onTitleChange } = $props();
    let value = $state(item.system.skillType || "active");

    const selectOptions = [
        { value: "active", label: localize(config.skill.active) },
        { value: "knowledge", label: localize(config.skill.knowledge) },
        { value: "language", label: localize(config.skill.language) },
    ];

    const rawAttributes = ActorDataService.getLocalizedLinkingAttibutes();
    const attributeOptions = Object.entries(rawAttributes).map(
        ([key, label]) => ({
            value: key,
            label,
        }),
    );

    function updateSkillType(newValue) {
        value = newValue;
        item.update({ "system.skillType": newValue });
        onTitleChange(`${localize(config.skill[newValue])}: ${item.name}`);
    }
</script>

<div class="sr3e-general-grid">
    <div class="item-sheet-component">
        <div class="sr3e-inner-background-container">
            <div class="fake-shadow"></div>
            <div class="sr3e-inner-background">
                <div class="image-mask">
                    <img
                        src={item.img}
                        role="presentation"
                        data-edit="img"
                        title={item.name}
                        alt={item.name}
                        onclick={async () => openFilePicker(item)}
                    />
                </div>
                <div class="stat-grid single-column">
                    <div class="stat-card">
                        <input
                            class="large"
                            name="name"
                            type="text"
                            bind:value={item.name}
                            onchange={(e) =>
                                item.update({ name: e.target.value })}
                        />
                    </div>
                    <div class="stat-card">
                        <select
                            bind:value
                            onchange={(e) => updateSkillType(e.target.value)}
                        >
                            {#each selectOptions as option}
                                <option value={option.value}
                                    >{option.label}</option
                                >
                            {/each}
                        </select>
                    </div>
                    {#if value === "active"}
                        <div class="stat-card">
                            <select
                                bind:value={
                                    item.system.activeSkill.linkedAttribute
                                }
                                onchange={(e) =>
                                    item.update({
                                        "system.activeSkill.linkedAttribute":
                                            e.target.value,
                                    })}
                            >
                                <option disabled value=""
                                    >{localize(
                                        config.skill.linkedAttribute,
                                    )}</option
                                >

                                {#each attributeOptions as option}
                                    <option value={option.value}
                                        >{option.label}</option
                                    >
                                {/each}
                            </select>
                        </div>
                    {:else if value === "knowledge"}{:else if value === "language"}{/if}
                </div>
            </div>
        </div>
    </div>
    <JournalViewer {item} {config} />
</div>
