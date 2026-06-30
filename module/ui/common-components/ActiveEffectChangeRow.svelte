<script lang="ts">
import { localize } from "../../services/utilities";
import ComboSearch from "./ComboSearch.svelte";
import type { GadgetChangeType, GadgetPropertyOption } from "../../services/gadgets/gadgetTargets";

type Change = { key: string; type: string; value: string; priority: number };

const changeTypeOptions: { value: GadgetChangeType; label: string }[] = [
    { value: "add", label: "ADD" },
    { value: "subtract", label: "SUBTRACT" },
    { value: "override", label: "OVERRIDE" },
];

const p = $props<{
    change: Change;
    index: number;
    propertyOptions: GadgetPropertyOption[];
    onUpdate: (index: number, field: string, value: unknown) => void;
    onDelete: (index: number) => void;
}>();

const selectedProperty = $derived(p.propertyOptions.find(option => option.value === p.change.key));
const visibleChangeTypeOptions = $derived(
    selectedProperty
        ? changeTypeOptions.filter(option => selectedProperty.changeTypes.includes(option.value))
        : changeTypeOptions
);

function selectProperty(value: string) {
    p.onUpdate(p.index, "key", value);
    const property = p.propertyOptions.find(option => option.value === value);
    if (property && !property.changeTypes.includes(p.change.type as GadgetChangeType)) {
        p.onUpdate(p.index, "type", property.changeTypes[0]);
    }
}
</script>

<tr class="effect-change-row">
    <td class="effect-change-cell effect-change-cell--attribute">
        <ComboSearch
            options={p.propertyOptions}
            value={p.change.key}
            css="effect-change-search"
            placeholder={localize(CONFIG.SR3E.EFFECTS.selectProperty)}
            nomatchplaceholder={localize(CONFIG.SR3E.EFFECTS.noMatch)}
            onselect={selectProperty}
        />
    </td>
    <td class="effect-change-cell effect-change-cell--mode">
        <div class="effect-change-frame effect-change-frame--select">
            <select value={p.change.type} onchange={(e) => p.onUpdate(p.index, "type", (e.target as HTMLSelectElement).value)}>
                {#each visibleChangeTypeOptions as option}
                    <option value={option.value}>{option.label}</option>
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
