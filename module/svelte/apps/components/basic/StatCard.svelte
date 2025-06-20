<script>
  import { localize } from "../../../../svelteHelpers.js";
  let { value, label, children } = $props();
</script>

<div class="stat-card">
  <div class="stat-card-background"></div>
  {#if label?.length > 0}
    <h4 class="no-margin uppercase">{localize(label)}</h4>
  {/if}
  {#if children}
    {@render children?.()}
  {:else}
    <h1 class="stat-value">{value}</h1>
  {/if}
</div>
