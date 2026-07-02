<script lang="ts">
import { untrack } from "svelte";
import { gadgetTargetLabel } from "../../../../../services/gadgets/gadgetTargets";

const p = $props<{ item: Item }>();
const item = untrack(() => p.item);
const sys = item.system as Record<string, any>;
</script>

{#if sys.type === "fetish"}
    <h4 class="no-margin uppercase">{item.name}</h4>
{/if}
<h4 class="no-margin uppercase">{gadgetTargetLabel(sys.type)}</h4>
<h4 class="no-margin uppercase">¥ {sys.commodity?.cost ?? 0}</h4>
