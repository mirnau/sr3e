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

<tr class="effect-change-row">
    <td class="effect-change-cell effect-change-cell--attribute">
        <ComboSearch
            options={p.propertyOptions}
            value={p.change.key}
            css="effect-change-search"
            placeholder={localize(CONFIG.SR3E.EFFECTS.selectProperty)}
            nomatchplaceholder={localize(CONFIG.SR3E.EFFECTS.noMatch)}
            onselect={(v) => p.onUpdate(p.index, "key", v)}
        />
    </td>
    <td class="effect-change-cell effect-change-cell--mode">
        <div class="effect-change-frame effect-change-frame--select">
            <select value={p.change.mode} onchange={(e) => p.onUpdate(p.index, "mode", parseInt((e.target as HTMLSelectElement).value))}>
                {#each Object.entries(CONST.ACTIVE_EFFECT_MODES).filter(([label]) => label !== "CUSTOM" && label !== "MULTIPLY") as [label, val]}
                    <option value={val}>{label}</option>
                {/each}
            </select>
        </div>
    </td>
    <td class="effect-change-cell effect-change-cell--value">
        <div class="effect-change-frame">
            <input type="text" value={p.change.value} oninput={(e) => p.onUpdate(p.index, "value", (e.target as HTMLInputElement).value)} />
        </div>
    </td>
    <td class="effect-change-cell effect-change-cell--priority">
        <div class="effect-change-frame effect-change-frame--number">
            <input type="number" value={p.change.priority} oninput={(e) => p.onUpdate(p.index, "priority", +(e.target as HTMLInputElement).value)} />
        </div>
    </td>
    <td class="effect-change-cell effect-change-cell--actions">
        <button
            type="button"
            class="effect-change-delete fas fa-trash-can"
            aria-label={localize(CONFIG.SR3E.EFFECTS.actions)}
            onclick={() => p.onDelete(p.index)}
        ></button>
    </td>
</tr>
