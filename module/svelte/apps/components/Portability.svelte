<script>
    import StatCard from "./StatCard.svelte";
    let { item, title,  gridCss } = $props();
    const system = $state(item.system);
    const portability = system.portability;

    const entries = [
        {
            item,
            key: "conceal",
            label: "Concealability",
            value: portability.conceal,
            path: "system.portability",
            type: "number",
        },
        {
            item,
            key: "weight",
            label: "Weight",
            value: portability.weight,
            path: "system.portability",
            type: "number",
        },
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
