<script lang="ts">
import { untrack } from "svelte";
import { localize } from "../../services/utilities";
import Image from "../common-components/Image.svelte";
import ItemSheetComponent from "../common-components/ItemSheetComponent.svelte";
import ItemSheetWrapper from "../common-components/ItemSheetWrapper.svelte";
import JournalViewer from "../common-components/JournalViewer.svelte";
import ActiveEffectsViewer from "../common-components/ActiveEffectsViewer.svelte";
import LabeledBoolean from "./LabeledBoolean.svelte";
import LabeledNumberInput from "./LabeledNumberInput.svelte";
import LabeledDropdown from "./LabeledDropdown.svelte";

type TnModifier = { targetKind: "skill" | "attribute"; targetId: string; modifier: number };

const ATTRIBUTE_TARGET_IDS = [
    "body", "quickness", "strength", "charisma", "intelligence", "willpower", "reaction", "magic", "initiative",
];

const p = $props<{ item: Item }>();
const item = untrack(() => p.item);
const system = item.system as Record<string, any>;

let name = $state(item.name as string);
let isActive = $state(Boolean(system.isActive));
let hasDrain = $state(Boolean(system.hasDrain));
let tnModifiers = $state<TnModifier[]>([...(system.tnModifiers ?? [])]);

function skillOptions(): { value: string; label: string }[] {
    const parent = (item as any).parent;
    if (!parent) return [];
    return [...(parent.items ?? [])]
        .filter((entry: any) => entry.type === "skill")
        .map((skill: any) => ({ value: skill.id, label: skill.name as string }));
}

function attributeOptions(): { value: string; label: string }[] {
    return ATTRIBUTE_TARGET_IDS.map((key) => ({ value: key, label: localize(CONFIG.SR3E.ATTRIBUTES[key]) }));
}

function onActiveChange(val: boolean) {
    isActive = val;
    if (!val) { hasDrain = false; item.update({ "system.hasDrain": false }, { render: false }); }
    item.update({ "system.isActive": val }, { render: false });
}

function onHasDrainChange(val: boolean) {
    hasDrain = val;
    item.update({ "system.hasDrain": val }, { render: false });
}

function addTnModifier() {
    tnModifiers = [...tnModifiers, { targetKind: "skill", targetId: "", modifier: 0 }];
    item.update({ "system.tnModifiers": tnModifiers }, { render: false });
}

function updateTnModifier(index: number, patch: Partial<TnModifier>) {
    tnModifiers = tnModifiers.map((row, i) => (i === index ? { ...row, ...patch } : row));
    item.update({ "system.tnModifiers": tnModifiers }, { render: false });
}

function removeTnModifier(index: number) {
    tnModifiers = tnModifiers.filter((_, i) => i !== index);
    item.update({ "system.tnModifiers": tnModifiers }, { render: false });
}
</script>

<ItemSheetWrapper csslayout="triple">
    <ItemSheetComponent>
        <Image entity={item} />
        <div class="large-input-wrapper">
            <div class="large-input-background"></div>
            <input
                class="large"
                name="name"
                type="text"
                value={name}
                onchange={(e) => item.update({ name: (e.target as HTMLInputElement).value })}
            />
        </div>
        <div class="stat-grid two-column">
            <LabeledNumberInput {item} key="powerPointCost" label={localize(CONFIG.SR3E.ADEPT_POWER.powerPointCost)} value={system.powerPointCost ?? 0} path="system" />
            <LabeledNumberInput {item} key="rating" label={localize(CONFIG.SR3E.ADEPT_POWER.rating)} value={system.rating ?? 0} path="system" />
        </div>
    </ItemSheetComponent>

    <ItemSheetComponent>
        <LabeledBoolean {item} key="isActive" label={localize(CONFIG.SR3E.ADEPT_POWER.isActive)} value={isActive} path="system" onUpdate={onActiveChange} />
        <LabeledBoolean {item} key="hasDrain" label={localize(CONFIG.SR3E.ADEPT_POWER.hasDrain)} value={hasDrain} path="system" disabled={!isActive} onUpdate={onHasDrainChange} />
    </ItemSheetComponent>

    <ItemSheetComponent>
        <div class="adeptpower-list-header">
            <h3>{localize(CONFIG.SR3E.ADEPT_POWER.tnModifiers)}</h3>
            <button type="button" class="sr3e-toolbar-button fa-solid fa-plus" aria-label={localize(CONFIG.SR3E.ADEPT_POWER.addRow)} onclick={addTnModifier}></button>
        </div>
        {#each tnModifiers as row, i}
            <div class="adeptpower-list-row">
                <LabeledDropdown
                    key={`tnTargetKind-${i}`}
                    label={localize(CONFIG.SR3E.ADEPT_POWER.targetKind)}
                    value={row.targetKind}
                    options={[
                        { value: "skill", label: localize(CONFIG.SR3E.ADEPT_POWER.skill) },
                        { value: "attribute", label: localize(CONFIG.SR3E.ADEPT_POWER.attribute) },
                    ]}
                    onUpdate={(val) => updateTnModifier(i, { targetKind: val as "skill" | "attribute", targetId: "" })}
                />
                <LabeledDropdown
                    key={`tnTargetId-${i}`}
                    label={localize(CONFIG.SR3E.ADEPT_POWER.targetId)}
                    value={row.targetId}
                    options={row.targetKind === "skill" ? skillOptions() : attributeOptions()}
                    onUpdate={(val) => updateTnModifier(i, { targetId: val })}
                />
                <input
                    type="number"
                    value={row.modifier}
                    onchange={(e) => updateTnModifier(i, { modifier: Number((e.target as HTMLInputElement).value) })}
                />
                <button type="button" class="sr3e-toolbar-button fa-solid fa-trash-can" aria-label={localize(CONFIG.SR3E.ADEPT_POWER.removeRow)} onclick={() => removeTnModifier(i)}></button>
            </div>
        {/each}
    </ItemSheetComponent>

    <ItemSheetComponent spanTwo={true}>
        <h3>{localize(CONFIG.SR3E.EFFECTS.effectview)}</h3>
        <ActiveEffectsViewer document={item} isSlim={true} />
    </ItemSheetComponent>

    <JournalViewer document={item} />
</ItemSheetWrapper>
