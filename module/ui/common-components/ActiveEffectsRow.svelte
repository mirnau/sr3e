<script lang="ts">
import { localize } from "../../services/utilities";
import Switch from "./Switch.svelte";
import type { ActiveEffectViewModel } from "./activeEffectViewModel";

const p = $props<{
    effectData: ActiveEffectViewModel;
    onEdit: (d: ActiveEffectViewModel) => void;
    onDelete: (d: ActiveEffectViewModel) => void;
    canDelete: (d: ActiveEffectViewModel) => boolean;
}>();
const effectData = $derived(p.effectData);
const activeEffect = $derived(effectData.activeEffect);

async function onToggleEnabled(e: Event) {
    const enabled = (e.currentTarget as HTMLInputElement).checked;
    await (activeEffect as any).update({ disabled: !enabled }, { render: false });
}

function formatDuration(duration: Record<string, unknown>): string {
    const units = duration?.units as string | undefined;
    if (!units) return localize(CONFIG.SR3E.EFFECTS.permanent);
    const value = (duration[units] as number) ?? (duration.value as number) ?? 0;
    if (units === "seconds" && value === 0) return localize(CONFIG.SR3E.EFFECTS.permanent);
    return `${value} ${units}`;
}
</script>

<tr>
    <td><div class="cell-content"><img src={effectData.img} alt={effectData.name} /></div></td>
    <td><div class="cell-content">{effectData.name}</div></td>
    <td><div class="cell-content">{formatDuration(effectData.duration)}</div></td>
    <td>
        <Switch checked={effectData.enabled} ariaLabel={localize(CONFIG.SR3E.EFFECTS.enabled)} onChange={onToggleEnabled} />
    </td>
    <td>
        <div class="cell-content">
            <div class="buttons-horizontal-distribution square">
                <button type="button" class="fas fa-edit" aria-label={localize(CONFIG.SR3E.EFFECTS.actions)} onclick={() => p.onEdit(effectData)}></button>
                <button type="button" class="fas fa-trash-can" aria-label={localize(CONFIG.SR3E.EFFECTS.actions)} disabled={!p.canDelete(effectData)} onclick={() => p.onDelete(effectData)}></button>
            </div>
        </div>
    </td>
</tr>
