<script>
    import { localize } from "../../../svelteHelpers.js";

    let { stat, config, key, isShoppingState } = $props();

    let baseTotal = $derived(stat.value + stat.mod);
    let total = $derived(baseTotal + (stat.meta ?? 0));
</script>

<div class="stat-card">
<h3>{localize(config.attributes[key])}</h3>
    {#if stat.meta == null}
        <h1 class="stat-value">{baseTotal}</h1>
    {:else}
        <div class="stat-label">
            {#if isShoppingState}
                <i class="fa-solid fa-circle-chevron-down"></i>
            {/if}
            <h1 class="stat-value">{total}</h1>
            {#if isShoppingState}
                <i class="fa-solid fa-circle-chevron-up"></i>
            {/if}
        </div>
    {/if}
</div>