<script>
    import { localize, openFilePicker } from "../../svelteHelpers.js";
    import JournalViewer from "./components/JournalViewer.svelte";
    import StatCard from "./components/StatCard.svelte";
    import Commodity from "./components/Commodity.svelte";
    import Portability from "./components/Portability.svelte";

    let { item = {}, config = {} } = $props();
    const system = $state(item.system);
    const weapon = system.weapon;

    const mode = {
        item,
        key: "mode",
        label: "Mode",
        value: weapon.mode,
        path: "system.weapon",
        type: "select",
        options: [
            localize(config.weapon.manual),
            localize(config.weapon.semiauto),
            localize(config.weapon.fullauto),
            localize(config.weapon.blade),
            localize(config.weapon.explosive),
            localize(config.weapon.energy),
            localize(config.weapon.blunt),
        ],
    };

    const weaponEntries = [
        {
            item,
            key: "damage",
            label: "Damage",
            value: weapon.damage,
            path: "system.weapon",
            type: "text",
        },
        {
            item,
            key: "range",
            label: "Range",
            value: weapon.range,
            path: "system.weapon",
            type: "number",
        },
        {
            item,
            key: "recoilComp",
            label: "Recoil Compensation",
            value: weapon.recoilComp,
            path: "system.weapon",
            type: "number",
        },
        {
            item,
            key: "currentClipId",
            label: "Current Clip ID",
            value: weapon.currentClipId,
            path: "system.weapon",
            type: "text",
        },
    ];
</script>

<div class="meta-human-grid">
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
            </div>
        </div>
    </div>

    <div class="item-sheet-component">
        <div class="sr3e-inner-background-container">
            <div class="fake-shadow"></div>
            <div class="sr3e-inner-background">
                <div class="details">
                    <h3>{localize(config.common.details)}</h3>
                </div>
                <div class="stat-grid single-column">
                    <StatCard {...mode} />
                </div>

                <div class="stat-grid two-column">
                    {#each weaponEntries as entry}
                        <StatCard {...entry} />
                    {/each}
                </div>
            </div>
        </div>
    </div>

    <Commodity
        {item}
        title={localize(config.commodity.commodity)}
        gridCss="two-column"
    />

    <Portability
        {item}
        title={localize(config.portability.portability)}
        gridCss="two-column"
    />

    <div class="item-sheet-component">
        <div class="sr3e-inner-background-container">
            <div class="fake-shadow"></div>
            <div class="sr3e-inner-background">
                <JournalViewer {item} {config} />
            </div>
        </div>
    </div>
</div>
