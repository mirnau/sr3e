<script>
    import AttributeCard from "./AttributeCard.svelte";
    import { localize } from "../../../foundry/SvelteHelpers.js";
    let { actor = {}, config = {} } = $props();

    // Expose all attributes from the actor record.
    let attributes = $state(actor.system.attributes);
</script>

<h1>{localize(config.attributes.attributes)}</h1>
<div class="attribute-masonry-grid">
    <div class="attribute-grid-sizer"></div>
    <div class="attribute-gutter-sizer"></div>
    {#each Object.entries(attributes) as [key, stat]}
        <div class="stat-card">
            <AttributeCard statKey={key} {stat} {config} />
        </div>
    {/each}
</div>
