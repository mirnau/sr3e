<script lang="ts">
import { localize } from "../../../services/utilities";
import { vehicleConditionStage, vehicleConditionStageLabelKey, vehicleConditionRulesKey } from "../../../services/combat/vehicleConditionMonitor";

const p = $props<{ boxesFilled: number; onUpdate: (value: number) => void }>();

const boxes = $derived(Array.from({ length: 10 }, (_, i) => i < p.boxesFilled));
const stage = $derived(vehicleConditionStage(p.boxesFilled));
const localization = $derived(CONFIG.SR3E.MECHANICAL);
const stageLabel = $derived(stage ? localize(localization[vehicleConditionStageLabelKey(stage) as keyof typeof localization]) : "");
const stageRules = $derived(stage ? localize(localization[vehicleConditionRulesKey(stage) as keyof typeof localization]) : "");

function toggle(index: number, checked: boolean): void {
    p.onUpdate(checked ? index + 1 : index);
}
</script>

<div class="vehicle-condition-monitor">
    <h3 class="no-margin">{localize(localization?.condition)}</h3>
    <div class="condition-boxes">
        {#each boxes as checked, i}
            <input
                class="checkbox"
                type="checkbox"
                id={`vehicleConditionBox${i + 1}`}
                {checked}
                onchange={(e) => toggle(i, (e.target as HTMLInputElement).checked)}
            />
        {/each}
    </div>
    {#if stage}
        <div class="condition-stage">
            <h4 class="no-margin">{stageLabel}</h4>
            <p class="no-margin">{stageRules}</p>
        </div>
    {/if}
</div>
