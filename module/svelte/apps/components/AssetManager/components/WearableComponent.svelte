<script>
   import { localize } from "@services/utilities.js";
   let { item, config } = $props();
</script>

<h4 class="no-margin uppercase">¥ {item.system.commodity.cost}</h4>
<h4 class="no-margin uppercase">
   {localize(config.wearable.impact)}: {item.system.impact}
</h4>
<h4 class="no-margin uppercase">
   {localize(config.wearable.ballistic)}: {item.system.ballistic}
</h4>
