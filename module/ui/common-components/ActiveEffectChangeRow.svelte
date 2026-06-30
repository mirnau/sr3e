<script lang="ts">
import { localize } from "../../services/utilities";
import ComboSearch from "./ComboSearch.svelte";

type Change = { key: string; mode: number; value: string; priority: number };
type Option = { value: string; label: string };

const p = $props<{
    change: Change;
    index: number;
    propertyOptions: Option[];
    onUpdate: (index: number, field: string, value: unknown) => void;
    onDelete: (index: number) => void;
}>();
</script>

<tr>
    <td>
        <ComboSearch
            options={p.propertyOptions}
            value={p.change.key}
            placeholder={localize(CONFIG.SR3E.EFFECTS.selectProperty)}
            nomatchplaceholder={localize(CONFIG.SR3E.EFFECTS.noMatch)}
            onselect={(v) => p.onUpdate(p.index, "key", v)}
        />
    </td>
    <td>
        <select value={p.change.mode} onchange={(e) => p.onUpdate(p.index, "mode", parseInt((e.target as HTMLSelectElement).value))}>
            {#each Object.entries(CONST.ACTIVE_EFFECT_MODES).filter(([label]) => label !== "CUSTOM" && label !== "MULTIPLY") as [label, val]}
                <option value={val}>{label}</option>
            {/each}
        </select>
    </td>
    <td>
        <input type="text" value={p.change.value} oninput={(e) => p.onUpdate(p.index, "value", (e.target as HTMLInputElement).value)} />
    </td>
    <td>
        <input type="number" value={p.change.priority} oninput={(e) => p.onUpdate(p.index, "priority", +(e.target as HTMLInputElement).value)} />
    </td>
    <td>
        <button type="button" onclick={() => p.onDelete(p.index)}>🗑</button>
    </td>
</tr>
