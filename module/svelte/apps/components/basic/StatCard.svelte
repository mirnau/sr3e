<script>
  import { localize } from "../../../../svelteHelpers.js";
  let { value, label } = $props();
</script>

<div class="stat-card">
  <div class="stat-card-background"></div>
  <h4 class="no-margin">
    {localize(label)}
  </h4>
  <h1 class="stat-value">{value}</h1>
</div>
