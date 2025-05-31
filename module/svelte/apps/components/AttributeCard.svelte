<script>
    import { localize } from "../../../svelteHelpers.js";

    let { stat, localization, key, isShoppingState } = $props();

    let baseTotal = $derived(stat.value + stat.mod);
    let total = $derived(baseTotal + (stat.meta ?? 0));

</script>

<div class="stat-card">
<h4 class="no-margin">{localize(localization[key])}</h4>
{#if "meta" in stat}
  <div class="stat-label">
    {#if isShoppingState}
      <i class="fa-solid fa-circle-chevron-down decrement-attribute"></i>
    {/if}
    <h1 class="stat-value">{total}</h1>
    {#if isShoppingState}
      <i class="fa-solid fa-circle-chevron-up increment-attribute"></i>
    {/if}
  </div>
{:else}
  <h1 class="stat-value">{baseTotal}</h1>
{/if}

</div>