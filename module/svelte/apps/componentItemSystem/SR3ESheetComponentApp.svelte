<script>
    import CardToolbar from "../components/CardToolbar.svelte";
    import SR3EGenericStatCard from "./SR3EGenericStatCard.svelte";

    let { item = {}, config = {}, component = {} } = $props();

    // Resolve the component index from item.system.components
    const componentIndex = item.system.components.findIndex(
        (c) => c.id === component.id,
    );
    if (componentIndex === -1)
        throw new Error("Component not found in item.system.components");

    // Alias for SheetComponents so the rest of the template stays clean
    let statCards = $state(component.SheetComponents);

    function getPath(statIndex) {
        return `system.components.${componentIndex}.SheetComponents.${statIndex}`;
    }
</script>

<div class="sheet-component">
    <div class="sr3e-inner-background-container">
        <div class="fake-shadow"></div>
        <div class="sr3e-inner-background">
            <CardToolbar id={component.id} doc={item} />
            <h3>{component.name}</h3>

            {#if statCards.length}
                {#each statCards as card, statIndex}
                    <SR3EGenericStatCard
                        {item}
                        path={getPath(statIndex)}
                        key={"value"}
                        label={card.name}
                        value={card.value}
                        type={card.type}
                        options={card.options || []}
                    />
                {/each}
            {:else}
                <p><em>No stat cards yet.</em></p>
            {/if}
        </div>
    </div>
</div>
