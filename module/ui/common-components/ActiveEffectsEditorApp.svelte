<script lang="ts">
import { onMount, onDestroy, untrack } from "svelte";
import { localize } from "../../services/utilities";
import ItemSheetComponent from "./ItemSheetComponent.svelte";
import ActiveEffectChangeRow from "./ActiveEffectChangeRow.svelte";
import LabeledTextInput from "../items/LabeledTextInput.svelte";
import LabeledDropdown from "../items/LabeledDropdown.svelte";
import LabeledBoolean from "../items/LabeledBoolean.svelte";
import LabeledNumberInput from "../items/LabeledNumberInput.svelte";

type Change = { key: string; mode: number; value: string; priority: number };
type Option = { value: string; label: string };

const p = $props<{ document: Item | Actor; activeEffect: ActiveEffect }>();
const doc = untrack(() => p.document);
const effect = untrack(() => p.activeEffect) as any;

const rawDuration = effect.duration ?? {};

let name = $state(effect.name as string);
let target = $state((effect.flags?.sr3e?.target as string) ?? "self");
let disabled = $state(!!effect.disabled);
let durationUnits = $state((rawDuration.units ?? rawDuration.type ?? "none") as string);
let durationValue = $state(Math.round((rawDuration.value as number) ?? 0));
let changes = $state<Change[]>([...(effect.changes ?? [])]);
let propertyOptions = $state<Option[]>([]);

const targetOptions: Option[] = [
    { value: "self", label: "self" },
    { value: "character", label: "character" },
];

const durationTypeOptions = $derived<Option[]>([
    { value: "none", label: localize(CONFIG.SR3E.EFFECTS.permanent) },
    ...["turns", "rounds", "seconds", "minutes", "hours", "days"].map(t => ({ value: t, label: t })),
]);

onMount(() => enumeratePaths());
onDestroy(() => { void commit(); });

function enumeratePaths() {
    const isCharacter = target === "character";
    const source = isCharacter
        ? foundry.utils.flattenObject({ system: (new (CONFIG.Actor.dataModels["character"] as any)({})).toObject?.() ?? {} })
        : foundry.utils.flattenObject({ system: doc.toObject?.()?.system ?? {} });
    propertyOptions = Object.keys(source)
        .filter(k => k.endsWith(".mod"))
        .map(k => ({ value: k, label: k }))
        .sort((a, b) => a.label.localeCompare(b.label));
}

async function commit() {
    await effect.update({
        name,
        disabled,
        transfer: target === "character",
        duration: { units: durationUnits, value: Math.round(durationValue) },
        changes: [...changes],
        flags: { ...effect.flags, sr3e: { ...effect.flags?.sr3e, target } },
    }, { render: false });
}

function onTargetChange(val: string) {
    target = val;
    enumeratePaths();
    void commit();
}

function updateChange(index: number, field: string, value: unknown) {
    changes = changes.map((c, i) => i === index ? { ...c, [field]: value } : c);
}

function addChange() { changes = [...changes, { key: "", mode: 2, value: "", priority: 0 }]; }
function deleteChange(index: number) { changes = changes.filter((_, i) => i !== index); }
</script>

<div class="effects-editor">
    <ItemSheetComponent>
        <h3>{localize(CONFIG.SR3E.EFFECTS.effectscomposer)}</h3>
        <div class="stat-grid single-column">

            <LabeledTextInput
                key="name"
                label={localize(CONFIG.SR3E.EFFECTS.name)}
                value={name}
                onUpdate={(val) => { name = val; void commit(); }}
            />

            <LabeledDropdown
                key="target"
                label={localize(CONFIG.SR3E.EFFECTS.target)}
                value={target}
                options={targetOptions}
                onUpdate={onTargetChange}
            />

            <LabeledBoolean
                key="disabled"
                label={localize(CONFIG.SR3E.EFFECTS.disabled)}
                value={disabled}
                onUpdate={(val) => { disabled = val; void commit(); }}
            />

            <LabeledDropdown
                key="durationUnits"
                label={localize(CONFIG.SR3E.EFFECTS.durationType)}
                value={durationUnits}
                options={durationTypeOptions}
                onUpdate={(val) => { durationUnits = val; void commit(); }}
            />

            {#if durationUnits !== "none"}
                <LabeledNumberInput
                    key="durationValue"
                    label={localize(CONFIG.SR3E.EFFECTS.value)}
                    value={durationValue}
                    onUpdate={(val) => { durationValue = val; void commit(); }}
                />
            {/if}

        </div>
    </ItemSheetComponent>

    <ItemSheetComponent>
        <h3>{localize(CONFIG.SR3E.EFFECTS.changesHeader)}</h3>
        <button type="button" onclick={addChange}>{localize(CONFIG.SR3E.EFFECTS.addChange)}</button>
        <table>
            <thead>
                <tr>
                    <th>{localize(CONFIG.SR3E.EFFECTS.attributeKey)}</th>
                    <th>{localize(CONFIG.SR3E.EFFECTS.changeMode)}</th>
                    <th>{localize(CONFIG.SR3E.EFFECTS.value)}</th>
                    <th>{localize(CONFIG.SR3E.EFFECTS.priority)}</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {#each changes as change, i}
                    <ActiveEffectChangeRow {change} index={i} {propertyOptions} onUpdate={updateChange} onDelete={deleteChange} />
                {/each}
            </tbody>
        </table>
    </ItemSheetComponent>
</div>
