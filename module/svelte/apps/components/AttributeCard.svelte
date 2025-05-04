<script>
    import { localize } from "../../../foundry/SvelteHelpers.js";

    let { stat, config, statKey } = $props();

    let baseTotal = $derived(stat.value + stat.mod);
    let total = $derived(baseTotal + (stat.meta ?? 0));
</script>

<h3>{localize(config.attributes[statKey] || statKey)}</h3>
{#if stat.meta == null}
    <h1 class="stat-value">{baseTotal}</h1>
{:else}
<div class="stat-label">
    <i class="fa-solid fa-circle-chevron-down"></i>
    <h1 class="stat-value">{total}</h1>
    <i class="fa-solid fa-circle-chevron-up"></i>
</div>
{/if}
