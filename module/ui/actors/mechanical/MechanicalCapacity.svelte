<script lang="ts">
import { localize } from "../../../services/utilities";
import LabeledNumberInput from "../../items/LabeledNumberInput.svelte";

const p = $props<{ system: Record<string, any>; update: (path: string, value: number) => void }>();

const isDrone = $derived(p.system.category === "drone");
</script>

<h3>{localize(CONFIG.SR3E.MECHANICAL.capacity)}</h3>
<div class="stat-grid two-column">
    <LabeledNumberInput key="cargo" label={localize(CONFIG.SR3E.MECHANICAL.cargo)} value={p.system.cargo?.value ?? 0} onUpdate={(v) => p.update("system.cargo.value", v)} />
    <LabeledNumberInput key="load" label={localize(CONFIG.SR3E.MECHANICAL.load)} value={p.system.load?.value ?? 0} onUpdate={(v) => p.update("system.load.value", v)} />
    {#if isDrone}
        <LabeledNumberInput key="setupBreakdownMinutes" label={localize(CONFIG.SR3E.MECHANICAL.setupBreakdownMinutes)} value={p.system.setupBreakdownMinutes ?? 0} onUpdate={(v) => p.update("system.setupBreakdownMinutes", v)} />
    {/if}
</div>
