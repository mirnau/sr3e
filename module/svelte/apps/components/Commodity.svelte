<script>
    import StatCard from "./StatCard.svelte";
    let { item, title, gridCss } = $props();
    const system = $state(item.system);
    const commodity = system.commodity;

    const entries = [
        {
            item,
            key: "days",
            label: "Days",
            value: commodity.days,
            path: "system.commodity",
            type: "number",
        },
        {
            item,
            key: "cost",
            label: "Cost",
            value: commodity.cost,
            path: "system.commodity",
            type: "number",
        },
        {
            item,
            key: "streetIndex",
            label: "Street Index",
            value: commodity.streetIndex,
            path: "system.commodity",
            type: "number",
        },
        {
            item,
            key: "restrictionLevel",
            label: "Restriction Level",
            value: commodity.legality.restrictionLevel,
            path: "system.commodity.legality",
            type: "number",
        },
        {
            item,
            key: "type",
            label: "Legality Type",
            value: commodity.legality.type,
            path: "system.commodity.legality",
            type: "text",
        },
        {
            item,
            key: "category",
            label: "Legality Category",
            value: commodity.legality.category,
            path: "system.commodity.legality",
            type: "text",
        },
        {
            item,
            key: "isBroken",
            label: "Is Broken",
            value: commodity.isBroken,
            path: "system.commodity",
            type: "checkbox",
        }
    ];
</script>

<div class="item-sheet-component">
    <div class="sr3e-inner-background-container">
        <div class="fake-shadow"></div>
        <div class="sr3e-inner-background">
            <h3>{title}</h3>
            <div class="stat-grid {gridCss}">
                {#each entries as entry}
                    <StatCard {...entry} />
                {/each}
            </div>
        </div>
    </div>
</div>
