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

const p = $props<{ item: Item }>();
const item = untrack(() => p.item);
const system = item.system as Record<string, any>;

let name = $state(item.name as string);
let category = $state(system.category as string);
let durationType = $state(system.duration?.type as string);
let manipulationSubtype = $state(system.manipulationSubtype as string);
let targetingKind = $state(system.targeting?.kind as string);
let thresholdMode = $state(system.threshold?.mode as string);

const isManipulation = $derived(category === "manipulation");
const isControlManipulation = $derived(isManipulation && manipulationSubtype === "control");
const isElementalManipulation = $derived(isManipulation && manipulationSubtype === "elemental");
const usesGenericTargeting = $derived(!isElementalManipulation);
const usesResistanceAttribute = $derived(usesGenericTargeting && (targetingKind === "attribute" || isControlManipulation));
const usesThreshold = $derived(isManipulation && !isElementalManipulation);

function kvOptions(map: Record<string, string>) {
    return Object.entries(map).map(([value, token]) => ({ value, label: localize(token) }));
}

function onCategoryChange(val: string) {
    category = val;
    (item as any).update({ "system.category": val }, { render: false });
}

function updateSystem(path: string, val: string | number | boolean) {
    (item as any).update({ [path]: val }, { render: false });
}

function onManipulationSubtypeChange(val: string) {
    manipulationSubtype = val;
    const update: Record<string, string | number | boolean> = { "system.manipulationSubtype": val };

    if (val === "control") {
        thresholdMode = "halfAttribute";
        update["system.resistance.attribute"] = "willpower";
        update["system.threshold.mode"] = "halfAttribute";
        update["system.threshold.attribute"] = "willpower";
        update["system.threshold.divisor"] = 2;
    }

    if (val === "elemental") {
        update["system.elementalAttack.targetNumber"] = 4;
        update["system.elementalAttack.canDodge"] = true;
        update["system.elementalAttack.armorMultiplier"] = 0.5;
    }

    (item as any).update(update, { render: false });
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
        <LabeledDropdown {item} key="manipulationSubtype" label={localize(CONFIG.SR3E.SPELL.manipulationSubtype)} value={manipulationSubtype ?? ""} options={kvOptions(CONFIG.SR3E.SPELL_MANIPULATION_SUBTYPES)} onUpdate={onManipulationSubtypeChange} disabled={!isManipulation} />
    </ItemSheetComponent>

    <ItemSheetComponent title={localize(CONFIG.SR3E.SPELL.casting)}>
        <LabeledNumberInput {item} key="learnedForce" label={localize(CONFIG.SR3E.SPELL.learnedForce)} value={system.learnedForce ?? 0} path="system" />
        <LabeledDropdown {item} key="range" label={localize(CONFIG.SR3E.SPELL.range)} value={system.range ?? ""} path="system" options={kvOptions(CONFIG.SR3E.SPELL_RANGES)} />
        <LabeledDropdown {item} key="type" label={localize(CONFIG.SR3E.SPELL.duration)} value={durationType ?? ""} options={kvOptions(CONFIG.SR3E.SPELL_DURATIONS)} onUpdate={(val) => { durationType = val; updateSystem("system.duration.type", val); }} />
        <LabeledNumberInput {item} key="rounds" label={localize(CONFIG.SR3E.SPELL.rounds)} value={system.duration?.rounds ?? 0} path="system.duration" disabled={durationType !== "sustained"} />
    </ItemSheetComponent>

    <ItemSheetComponent title={localize(CONFIG.SR3E.SPELL.targetingRules)}>
        <LabeledDropdown {item} key="kind" label={localize(CONFIG.SR3E.SPELL.targeting)} value={targetingKind ?? ""} options={kvOptions(CONFIG.SR3E.SPELL_TARGETING)} onUpdate={(val) => { targetingKind = val; updateSystem("system.targeting.kind", val); }} disabled={!usesGenericTargeting} />
        <LabeledDropdown {item} key="attribute" label={localize(CONFIG.SR3E.SPELL.targetAttribute)} value={system.targeting?.attribute ?? ""} path="system.targeting" options={kvOptions(CONFIG.SR3E.ATTRIBUTES)} disabled={!usesGenericTargeting || targetingKind !== "attribute"} />
        <LabeledNumberInput {item} key="staticTargetNumber" label={localize(CONFIG.SR3E.SPELL.staticTargetNumber)} value={system.targeting?.staticTargetNumber ?? 0} path="system.targeting" disabled={!usesGenericTargeting || targetingKind !== "static"} />
        <LabeledDropdown {item} key="attribute" label={localize(CONFIG.SR3E.SPELL.resistanceAttribute)} value={system.resistance?.attribute ?? ""} path="system.resistance" options={kvOptions(CONFIG.SR3E.ATTRIBUTES)} disabled={!usesResistanceAttribute} />
    </ItemSheetComponent>

    <ItemSheetComponent title={localize(CONFIG.SR3E.SPELL.elementalRules)}>
        <LabeledNumberInput {item} key="targetNumber" label={localize(CONFIG.SR3E.SPELL.attackTargetNumber)} value={system.elementalAttack?.targetNumber ?? 4} path="system.elementalAttack" disabled={!isElementalManipulation} />
        <LabeledBoolean {item} key="canDodge" label={localize(CONFIG.SR3E.SPELL.canDodge)} value={Boolean(system.elementalAttack?.canDodge ?? true)} path="system.elementalAttack" disabled={!isElementalManipulation} />
        <LabeledNumberInput {item} key="armorMultiplier" label={localize(CONFIG.SR3E.SPELL.armorMultiplier)} value={system.elementalAttack?.armorMultiplier ?? 0.5} path="system.elementalAttack" disabled={!isElementalManipulation} />
    </ItemSheetComponent>

    <ItemSheetComponent title={localize(CONFIG.SR3E.SPELL.thresholdRules)}>
        <LabeledDropdown {item} key="mode" label={localize(CONFIG.SR3E.SPELL.thresholdMode)} value={thresholdMode ?? "none"} options={kvOptions(CONFIG.SR3E.SPELL_THRESHOLD_MODES)} onUpdate={(val) => { thresholdMode = val; updateSystem("system.threshold.mode", val); }} disabled={!usesThreshold} />
        <LabeledDropdown {item} key="attribute" label={localize(CONFIG.SR3E.SPELL.thresholdAttribute)} value={system.threshold?.attribute ?? "willpower"} path="system.threshold" options={kvOptions(CONFIG.SR3E.ATTRIBUTES)} disabled={!usesThreshold || thresholdMode !== "halfAttribute"} />
        <LabeledNumberInput {item} key="divisor" label={localize(CONFIG.SR3E.SPELL.thresholdDivisor)} value={system.threshold?.divisor ?? 2} path="system.threshold" disabled={!usesThreshold || thresholdMode !== "halfAttribute"} />
        <LabeledNumberInput {item} key="value" label={localize(CONFIG.SR3E.SPELL.thresholdValue)} value={system.threshold?.value ?? 0} path="system.threshold" disabled={!usesThreshold || thresholdMode !== "static"} />
    </ItemSheetComponent>

    <ItemSheetComponent title={localize(CONFIG.SR3E.SPELL.drain)}>
        <LabeledNumberInput {item} key="powerModifier" label={localize(CONFIG.SR3E.SPELL.drainPowerModifier)} value={system.drain?.powerModifier ?? 0} path="system.drain" />
        <LabeledDropdown {item} key="damageLevel" label={localize(CONFIG.SR3E.SPELL.drainDamageLevel)} value={system.drain?.damageLevel ?? ""} path="system.drain" options={kvOptions(CONFIG.SR3E.SPELL_DRAIN_LEVELS)} />
        <LabeledNumberInput {item} key="damageLevelModifier" label={localize(CONFIG.SR3E.SPELL.drainDamageLevelModifier)} value={system.drain?.damageLevelModifier ?? 0} path="system.drain" />
    </ItemSheetComponent>

    <ItemSheetComponent title={localize(CONFIG.SR3E.SPELL.limitations)}>
        <LabeledBoolean {item} key="fetish" label={localize(CONFIG.SR3E.SPELL.fetishLimited)} value={Boolean(system.limits?.fetish)} path="system.limits" />
        <LabeledBoolean {item} key="exclusive" label={localize(CONFIG.SR3E.SPELL.exclusiveLimited)} value={Boolean(system.limits?.exclusive)} path="system.limits" />
    </ItemSheetComponent>

    <JournalViewer document={item} />
</ItemSheetWrapper>
