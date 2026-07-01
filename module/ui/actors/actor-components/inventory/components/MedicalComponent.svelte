<script lang="ts">
import { localize } from "../../../../../services/utilities";

const p = $props<{ item: Item }>();

const hasGadget = $derived(
    (p.item as any).effects?.contents?.some(
        (e: any) => e.flags?.sr3e?.gadget?.type === "gadget"
    ) ?? false
);
</script>

<div class="medical-status">
    {#if hasGadget}
        <span class="medical-supplied">{localize(CONFIG.SR3E.MEDICAL.supplied)}</span>
    {:else}
        <span class="medical-depleted">{localize(CONFIG.SR3E.MEDICAL.depleted)}</span>
    {/if}
</div>
