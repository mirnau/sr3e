<script lang="ts">
import { untrack } from "svelte";
import { localize } from "../../services/utilities";
import Switch from "./Switch.svelte";

type EffectData = {
    activeEffect: ActiveEffect;
    sourceDocument: Item | Actor;
    canDelete: boolean;
};

const p = $props<{ effectData: EffectData; onEdit: (d: EffectData) => void; onDelete: (d: EffectData) => void; canDelete: (d: EffectData) => boolean }>();
const effectData = untrack(() => p.effectData);
const { activeEffect } = effectData;

let enabled = $state(!activeEffect.disabled);

$effect(() => {
    enabled = !activeEffect.disabled;
});

async function onToggleEnabled(e: Event) {
    enabled = (e.currentTarget as HTMLInputElement).checked;
    await (activeEffect as any).update({ disabled: !enabled }, { render: false });
}

function formatDuration(duration: Record<string, unknown>): string {
    const units = (duration?.units ?? duration?.type) as string | undefined;
    if (!units || units === "none") return localize(CONFIG.SR3E.EFFECTS.permanent);
    const value = (duration[units] as number) ?? 0;
    const map: Record<string, string> = { rounds: `${value}r`, turns: `${value}t`, seconds: `${value}s`, minutes: `${value}m`, hours: `${value}h`, days: `${value}d` };
    return map[units] ?? "?";
}
</script>

<tr>
    <td><div class="cell-content"><img src={(activeEffect as any).img} alt={(activeEffect as any).name} /></div></td>
    <td><div class="cell-content">{(activeEffect as any).name}</div></td>
    <td><div class="cell-content">{formatDuration((activeEffect as any).duration ?? {})}</div></td>
    <td>
        <Switch checked={enabled} ariaLabel={localize(CONFIG.SR3E.EFFECTS.enabled)} onChange={onToggleEnabled} />
    </td>
    <td>
        <div class="cell-content">
            <div class="buttons-horizontal-distribution square">
                <button type="button" class="fas fa-edit" aria-label={localize(CONFIG.SR3E.EFFECTS.actions)} onclick={() => p.onEdit(effectData)}></button>
                <button type="button" class="fas fa-trash-can" disabled={!p.canDelete(effectData)} onclick={() => p.onDelete(effectData)}></button>
            </div>
        </div>
    </td>
</tr>
