<script lang="ts">
import { untrack } from "svelte";
import { localize } from "../../services/utilities";
import Image from "../common-components/Image.svelte";
import ItemSheetComponent from "../common-components/ItemSheetComponent.svelte";
import ItemSheetWrapper from "../common-components/ItemSheetWrapper.svelte";
import JournalViewer from "../common-components/JournalViewer.svelte";
import LabeledBoolean from "./LabeledBoolean.svelte";
import LabeledDropdown from "./LabeledDropdown.svelte";
import LabeledNumberInput from "./LabeledNumberInput.svelte";
import LabeledTextInput from "./LabeledTextInput.svelte";

const p = $props<{ item: Item }>();
const item = untrack(() => p.item);
const system = item.system as Record<string, any>;

let name = $state(item.name as string);
let category = $state(system.category as string);

function kvOptions(map: Record<string, string>) {
    return Object.entries(map).map(([value, token]) => ({ value, label: localize(token) }));
}

function onCategoryChange(val: string) {
    category = val;
    (item as any).update({ "system.category": val }, { render: false });
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
        <LabeledDropdown {item} key="type" label={localize(CONFIG.SR3E.SPELL.type)} value={system.type ?? ""} path="system" options={kvOptions(CONFIG.SR3E.SPELL_TYPES)} />
        <LabeledDropdown {item} key="category" label={localize(CONFIG.SR3E.SPELL.category)} value={category} path="system" options={kvOptions(CONFIG.SR3E.SPELL_CATEGORIES)} onUpdate={onCategoryChange} />
        <LabeledTextInput {item} key="manipulationSubtype" label={localize(CONFIG.SR3E.SPELL.manipulationSubtype)} value={system.manipulationSubtype ?? ""} path="system" disabled={category !== "manipulation"} />
    </ItemSheetComponent>

    <ItemSheetComponent>
        <LabeledNumberInput {item} key="learnedForce" label={localize(CONFIG.SR3E.SPELL.learnedForce)} value={system.learnedForce ?? 0} path="system" />
        <LabeledDropdown {item} key="range" label={localize(CONFIG.SR3E.SPELL.range)} value={system.range ?? ""} path="system" options={kvOptions(CONFIG.SR3E.SPELL_RANGES)} />
        <LabeledDropdown {item} key="type" label={localize(CONFIG.SR3E.SPELL.duration)} value={system.duration?.type ?? ""} path="system.duration" options={kvOptions(CONFIG.SR3E.SPELL_DURATIONS)} />
        <LabeledNumberInput {item} key="rounds" label={localize(CONFIG.SR3E.SPELL.rounds)} value={system.duration?.rounds ?? 0} path="system.duration" />
    </ItemSheetComponent>

    <ItemSheetComponent>
        <LabeledDropdown {item} key="kind" label={localize(CONFIG.SR3E.SPELL.targeting)} value={system.targeting?.kind ?? ""} path="system.targeting" options={kvOptions(CONFIG.SR3E.SPELL_TARGETING)} />
        <LabeledDropdown {item} key="attribute" label={localize(CONFIG.SR3E.SPELL.targetAttribute)} value={system.targeting?.attribute ?? ""} path="system.targeting" options={kvOptions(CONFIG.SR3E.ATTRIBUTES)} />
        <LabeledNumberInput {item} key="staticTargetNumber" label={localize(CONFIG.SR3E.SPELL.staticTargetNumber)} value={system.targeting?.staticTargetNumber ?? 0} path="system.targeting" />
        <LabeledDropdown {item} key="attribute" label={localize(CONFIG.SR3E.SPELL.resistanceAttribute)} value={system.resistance?.attribute ?? ""} path="system.resistance" options={kvOptions(CONFIG.SR3E.ATTRIBUTES)} />
    </ItemSheetComponent>

    <ItemSheetComponent>
        <LabeledNumberInput {item} key="powerModifier" label={localize(CONFIG.SR3E.SPELL.drainPowerModifier)} value={system.drain?.powerModifier ?? 0} path="system.drain" />
        <LabeledDropdown {item} key="damageLevel" label={localize(CONFIG.SR3E.SPELL.drainDamageLevel)} value={system.drain?.damageLevel ?? ""} path="system.drain" options={kvOptions(CONFIG.SR3E.SPELL_DRAIN_LEVELS)} />
        <LabeledNumberInput {item} key="damageLevelModifier" label={localize(CONFIG.SR3E.SPELL.drainDamageLevelModifier)} value={system.drain?.damageLevelModifier ?? 0} path="system.drain" />
    </ItemSheetComponent>

    <ItemSheetComponent>
        <LabeledBoolean {item} key="fetish" label={localize(CONFIG.SR3E.SPELL.fetishLimited)} value={Boolean(system.limits?.fetish)} path="system.limits" />
        <LabeledBoolean {item} key="exclusive" label={localize(CONFIG.SR3E.SPELL.exclusiveLimited)} value={Boolean(system.limits?.exclusive)} path="system.limits" />
    </ItemSheetComponent>

    <JournalViewer document={item} />
</ItemSheetWrapper>
