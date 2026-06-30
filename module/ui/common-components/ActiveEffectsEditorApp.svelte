<script lang="ts">
import { onMount, onDestroy, untrack } from "svelte";
import { localize } from "../../services/utilities";
import ItemSheetComponent from "./ItemSheetComponent.svelte";
import ActiveEffectChangeRow from "./ActiveEffectChangeRow.svelte";
import LabeledTextInput from "../items/LabeledTextInput.svelte";
import LabeledDropdown from "../items/LabeledDropdown.svelte";
import LabeledBoolean from "../items/LabeledBoolean.svelte";
import LabeledNumberInput from "../items/LabeledNumberInput.svelte";
import { activeEffectPropertyOptions } from "./activeEffectPropertyOptions";
import type { GadgetPropertyOption } from "../../services/gadgets/gadgetTargets";

type Change = { key: string; type: string; value: string; priority: number };
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
let changes = $state<Change[]>(normalizeChanges(effect.toObject?.().changes ?? effect.changes ?? []));
let propertyOptions = $state<GadgetPropertyOption[]>([]);

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
    propertyOptions = activeEffectPropertyOptions({ document: doc, activeEffect: effect, target });
}

function normalizeChanges(rawChanges: Record<string, unknown>[]): Change[] {
    return rawChanges.map((change) => ({
        key: String(change.key ?? ""),
        type: normalizeChangeType(change.type),
        value: String(change.value ?? ""),
        priority: Number(change.priority ?? 0),
    }));
}

function normalizeChangeType(type: unknown): string {
    if (type === "add" || type === "subtract" || type === "override") return type;
    return "add";
}

async function commit() {
    await effect.update({
        name,
        disabled,
        transfer: target === "character",
        duration: durationForCommit(),
        changes: [...changes],
        flags: { ...effect.flags, sr3e: { ...effect.flags?.sr3e, target } },
    }, { render: false });
}

function durationForCommit(): Record<string, unknown> {
    if (durationUnits === "none") return {};
    return { units: durationUnits, value: Math.round(durationValue) };
}

function onTargetChange(val: string) {
    target = val;
    enumeratePaths();
    void commit();
}

function updateChange(index: number, field: string, value: unknown) {
    changes = changes.map((c, i) => i === index ? { ...c, [field]: value } : c);
}

function addChange() { changes = [...changes, { key: "", type: "add", value: "", priority: 0 }]; }
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
        <button type="button" class="effect-change-add" onclick={addChange}>{localize(CONFIG.SR3E.EFFECTS.addChange)}</button>
        <table class="effect-changes-table">
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
