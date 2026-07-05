<script lang="ts">
import { untrack } from "svelte";
import { localize } from "../../services/utilities";
import Image from "../common-components/Image.svelte";
import ItemSheetComponent from "../common-components/ItemSheetComponent.svelte";
import ItemSheetWrapper from "../common-components/ItemSheetWrapper.svelte";
import JournalViewer from "../common-components/JournalViewer.svelte";
import Commodity from "../common-components/Commodity.svelte";
import Portability from "../common-components/Portability.svelte";
import ActiveEffectsViewer from "../common-components/ActiveEffectsViewer.svelte";
import LabeledDropdown from "./LabeledDropdown.svelte";
import LabeledNumberInput from "./LabeledNumberInput.svelte";
import { augmentationCategoryIcon, isDefaultAugmentationIcon } from "../../services/augmentations/augmentationIcons";

type TnModifier = { targetKind: "skill" | "attribute"; targetId: string; modifier: number };

const ATTRIBUTE_TARGET_IDS = [
    "body", "quickness", "strength", "charisma", "intelligence", "willpower", "reaction", "magic", "initiative",
];

const p = $props<{ item: Item }>();
const item = untrack(() => p.item);
const system = item.system as Record<string, any>;

let name = $state(item.name as string);
let imageSrc = $state(item.img ?? "");
let category = $state((system.category as string | undefined) ?? "cyberware");
let tnModifiers = $state<TnModifier[]>([...(system.tnModifiers ?? [])]);

function kvOptions(map: Record<string, string>) {
    return Object.entries(map).map(([value, token]) => ({ value, label: localize(token) }));
}

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

function updateCategory(value: string) {
    category = value;
    const updates: Record<string, unknown> = { "system.category": value };
    if (isDefaultAugmentationIcon(imageSrc || item.img)) {
        imageSrc = augmentationCategoryIcon(value);
        updates.img = imageSrc;
    }
    item.update(updates);
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
        <Image entity={item} src={imageSrc} />
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
        <LabeledDropdown
            {item}
            key="category"
            label={localize(CONFIG.SR3E.AUGMENTATION.category)}
            value={category}
            options={kvOptions(CONFIG.SR3E.AUGMENTATION_CATEGORIES)}
            onUpdate={updateCategory}
        />
        <LabeledNumberInput {item} key="essenceCost" label={localize(CONFIG.SR3E.AUGMENTATION.essenceCost)} value={system.essenceCost ?? 0} path="system" step="0.1" />
    </ItemSheetComponent>

    <ItemSheetComponent>
        <div class="adeptpower-list-header">
            <h3>{localize(CONFIG.SR3E.AUGMENTATION.tnModifiers)}</h3>
            <button type="button" class="sr3e-toolbar-button fa-solid fa-plus" aria-label={localize(CONFIG.SR3E.AUGMENTATION.addRow)} onclick={addTnModifier}></button>
        </div>
        {#each tnModifiers as row, i}
            <div class="adeptpower-list-row">
                <LabeledDropdown
                    key={`tnTargetKind-${i}`}
                    label={localize(CONFIG.SR3E.AUGMENTATION.targetKind)}
                    value={row.targetKind}
                    options={[
                        { value: "skill", label: localize(CONFIG.SR3E.AUGMENTATION.skill) },
                        { value: "attribute", label: localize(CONFIG.SR3E.AUGMENTATION.attribute) },
                    ]}
                    onUpdate={(val) => updateTnModifier(i, { targetKind: val as "skill" | "attribute", targetId: "" })}
                />
                <LabeledDropdown
                    key={`tnTargetId-${i}`}
                    label={localize(CONFIG.SR3E.AUGMENTATION.targetId)}
                    value={row.targetId}
                    options={row.targetKind === "skill" ? skillOptions() : attributeOptions()}
                    onUpdate={(val) => updateTnModifier(i, { targetId: val })}
                />
                <input
                    type="number"
                    value={row.modifier}
                    onchange={(e) => updateTnModifier(i, { modifier: Number((e.target as HTMLInputElement).value) })}
                />
                <button type="button" class="sr3e-toolbar-button fa-solid fa-trash-can" aria-label={localize(CONFIG.SR3E.AUGMENTATION.removeRow)} onclick={() => removeTnModifier(i)}></button>
            </div>
        {/each}
    </ItemSheetComponent>

    <ItemSheetComponent spanAll={true}>
        <h3>{localize(CONFIG.SR3E.EFFECTS.effectview)}</h3>
        <ActiveEffectsViewer document={item} isSlim={true} />
    </ItemSheetComponent>

    <Commodity {item} />
    <Portability {item} />
    <JournalViewer document={item} />
</ItemSheetWrapper>
