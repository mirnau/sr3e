<script>
    import { localize } from "../../../svelteHelpers.js";
    import StatCard from "./StatCard.svelte";
    let { item, config, gridCss = "" } = $props();
    const system = $state(item.system);
    const commodity = system.commodity;

    const entries = [
        {
            item,
            key: "days",
            label: localize(config.commodity.days),
            value: commodity.days,
            path: "system.commodity",
            type: "number",
        },
        {
            item,
            key: "cost",
            label: localize(config.commodity.cost),
            value: commodity.cost,
            path: "system.commodity",
            type: "number",
        },
        {
            item,
            key: "streetIndex",
            label: localize(config.commodity.streetIndex),
            value: commodity.streetIndex,
            path: "system.commodity",
            type: "number",
        },
        {
            item,
            key: "restrictionLevel",
            label: localize(config.commodity.restrictionLevel),
            value: commodity.legality.restrictionLevel,
            path: "system.commodity.legality",
            type: "number",
        },
        {
            item,
            key: "type",
            label: localize(config.commodity.legalityType),
            value: commodity.legality.type,
            path: "system.commodity.legality",
            type: "text",
        },
        {
            item,
            key: "category",
            label: localize(config.commodity.legalityCategory),
            value: commodity.legality.category,
            path: "system.commodity.legality",
            type: "text",
        },
        {
            item,
            key: "isBroken",
            label: localize(config.commodity.isBroken),
            value: commodity.isBroken,
            path: "system.commodity",
            type: "checkbox",
        },
    ];
</script>

<div class="item-sheet-component">
    <div class="sr3e-inner-background-container">
        <div class="fake-shadow"></div>
        <div class="sr3e-inner-background">
            <h3>{localize(config.commodity.commodity)}</h3>
            <div class="stat-grid {gridCss}">
                {#each entries as entry}
                    <StatCard {...entry} />
                {/each}
            </div>
        </div>
    </div>
</div>