<script lang="ts">
import { untrack } from "svelte";
import { localize } from "../../../../../services/utilities";

const p = $props<{ item: Item }>();
const item = untrack(() => p.item);
const sys = item.system as Record<string, any>;

const isActive = $derived(Boolean(sys.isActive));
</script>

<h4 class="no-margin uppercase">
    {localize(isActive ? CONFIG.SR3E.ADEPT_POWER.isActive : CONFIG.SR3E.ADEPT_POWER.passive)}
</h4>
{#if sys.rating}
    <h4 class="no-margin uppercase">{localize(CONFIG.SR3E.ADEPT_POWER.rating)}: {sys.rating}</h4>
{/if}
<h4 class="no-margin uppercase">{localize(CONFIG.SR3E.ADEPT_POWER.powerPointCost)}: {sys.powerPointCost ?? 0}</h4>
