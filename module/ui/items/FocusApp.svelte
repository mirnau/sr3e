<script lang="ts">
import { onDestroy, onMount, untrack } from "svelte";
import { localize } from "../../services/utilities";
import Commodity from "../common-components/Commodity.svelte";
import Image from "../common-components/Image.svelte";
import ItemSheetComponent from "../common-components/ItemSheetComponent.svelte";
import ItemSheetWrapper from "../common-components/ItemSheetWrapper.svelte";
import JournalViewer from "../common-components/JournalViewer.svelte";
import Portability from "../common-components/Portability.svelte";
import LabeledBoolean from "./LabeledBoolean.svelte";
import LabeledDropdown from "./LabeledDropdown.svelte";
import LabeledNumberInput from "./LabeledNumberInput.svelte";
import LabeledTextInput from "./LabeledTextInput.svelte";

const p = $props<{ item: Item }>();
const item = untrack(() => p.item);
const system = item.system as Record<string, any>;

let name = $state(item.name as string);
let focusType = $state(system.focusType as string);
let spellOptions = $state<{ value: string; label: string }[]>([]);

const usesSpecificSpell = $derived(focusType === "specificSpell" || focusType === "sustaining");
const usesSpellCategory = $derived(focusType === "spellCategory");
const usesSpiritType = $derived(focusType === "spirit");
const usesWeaponReach = $derived(focusType === "weapon");

function kvOptions(map: Record<string, string>) {
    return Object.entries(map).map(([value, token]) => ({ value, label: localize(token) }));
}

function onFocusTypeChange(val: string) {
    focusType = val;
    (item as any).update({ "system.focusType": val }, { render: false });
}

function buildSpellOptions() {
    const parent = (item as any).parent;
    if (!parent) {
        spellOptions = [];
        return;
    }

    spellOptions = [...(parent.items ?? [])]
        .filter((entry: any) => entry.type === "spell")
        .map((spell: any) => ({ value: spell.id, label: spell.name as string }));
}

onMount(() => {
    buildSpellOptions();
    const collection = (item as any).parent?.items.collection;
    if (!collection) return;

    collection.on("update", buildSpellOptions);
    collection.on("create", buildSpellOptions);
    collection.on("delete", buildSpellOptions);
});

onDestroy(() => {
    const collection = (item as any).parent?.items.collection;
    if (!collection) return;

    collection.off("update", buildSpellOptions);
    collection.off("create", buildSpellOptions);
    collection.off("delete", buildSpellOptions);
});
</script>

<ItemSheetWrapper csslayout="double">
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
        <LabeledDropdown
            {item}
            key="focusType"
            label={localize(CONFIG.SR3E.FOCUS.type)}
            value={focusType}
            path="system"
            options={kvOptions(CONFIG.SR3E.FOCUS_TYPES)}
            onUpdate={onFocusTypeChange}
        />
        <div class="stat-grid two-column">
            <LabeledNumberInput {item} key="force" label={localize(CONFIG.SR3E.FOCUS.force)} value={system.force ?? 0} path="system" />
            <LabeledNumberInput {item} key="spent" label={localize(CONFIG.SR3E.FOCUS.spentDice)} value={system.dice?.spent ?? 0} path="system.dice" />
        </div>
    </ItemSheetComponent>

    <ItemSheetComponent>
        <LabeledBoolean {item} key="bonded" label={localize(CONFIG.SR3E.FOCUS.bonded)} value={Boolean(system.bonded)} path="system" />
        <LabeledBoolean {item} key="active" label={localize(CONFIG.SR3E.FOCUS.active)} value={Boolean(system.active)} path="system" />
        <LabeledBoolean {item} key="expendable" label={localize(CONFIG.SR3E.FOCUS.expendable)} value={Boolean(system.expendable)} path="system" />
    </ItemSheetComponent>

    <ItemSheetComponent>
        <LabeledDropdown
            {item}
            key="spellItemId"
            label={localize(CONFIG.SR3E.FOCUS.spell)}
            value={system.scope?.spellItemId ?? ""}
            path="system.scope"
            options={spellOptions}
            disabled={!usesSpecificSpell}
        />
        <LabeledDropdown
            {item}
            key="category"
            label={localize(CONFIG.SR3E.FOCUS.category)}
            value={system.scope?.category ?? ""}
            path="system.scope"
            options={kvOptions(CONFIG.SR3E.SPELL_CATEGORIES)}
            disabled={!usesSpellCategory}
        />
        <LabeledTextInput
            {item}
            key="spiritType"
            label={localize(CONFIG.SR3E.FOCUS.spiritType)}
            value={system.scope?.spiritType ?? ""}
            path="system.scope"
            disabled={!usesSpiritType}
        />
        <LabeledNumberInput {item} key="reach" label={localize(CONFIG.SR3E.FOCUS.reach)} value={system.weapon?.reach ?? 0} path="system.weapon" disabled={!usesWeaponReach} />
    </ItemSheetComponent>

    <Commodity {item} />
    <Portability {item} />

    <JournalViewer document={item} />
</ItemSheetWrapper>
