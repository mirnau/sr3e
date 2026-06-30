<script lang="ts">
import { onDestroy, onMount, untrack } from "svelte";
import { localize } from "../../services/utilities";
import Image from "../common-components/Image.svelte";
import ItemSheetComponent from "../common-components/ItemSheetComponent.svelte";
import ItemSheetWrapper from "../common-components/ItemSheetWrapper.svelte";
import LabeledBoolean from "./LabeledBoolean.svelte";
import LabeledDropdown from "./LabeledDropdown.svelte";
import LabeledNumberInput from "./LabeledNumberInput.svelte";
import Commodity from "../common-components/Commodity.svelte";
import Portability from "../common-components/Portability.svelte";
import JournalViewer from "../common-components/JournalViewer.svelte";
import GadgetViewer from "../common-components/GadgetViewer.svelte";

const p = $props<{ item: Item }>();
const item = untrack(() => p.item);
const system = item.system as Record<string, any>;

let name = $state(item.name as string);
let skillOptions = $state<{ value: string; label: string }[]>([]);

function kvOptions(map: Record<string, string>) {
    return Object.entries(map).map(([value, token]) => ({ value, label: localize(token) }));
}

function buildSkillOptions() {
    const parent = (item as any).parent;
    if (!parent) return;

    const result: { value: string; label: string }[] = [];
    const skills = (parent.items as any[]).filter((i: any) => i.type === "skill");

    for (const skill of skills) {
        const baseLabel = skill.name as string;
        result.push({ value: skill.id, label: baseLabel });

        const sys = skill.system as Record<string, any>;
        let specializations: { name: string }[] = [];

        switch (sys.skillType) {
            case "active":    specializations = sys.activeSkill?.specializations ?? [];    break;
            case "knowledge": specializations = sys.knowledgeSkill?.specializations ?? []; break;
            case "language":  specializations = sys.languageSkill?.specializations ?? [];  break;
        }

        specializations.forEach((spec, i) => {
            result.push({ value: `${skill.id}::${i}`, label: `${baseLabel} — ${spec.name}` });
        });
    }

    skillOptions = result;
}

onMount(() => {
    buildSkillOptions();
    const collection = (item as any).parent?.items.collection;
    if (collection) {
        collection.on("update", buildSkillOptions);
        collection.on("create", buildSkillOptions);
        collection.on("delete", buildSkillOptions);
    }
});

onDestroy(() => {
    const collection = (item as any).parent?.items.collection;
    if (collection) {
        collection.off("update", buildSkillOptions);
        collection.off("create", buildSkillOptions);
        collection.off("delete", buildSkillOptions);
    }
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

        {#if (item as any).parent}
            <LabeledDropdown
                {item}
                key="linkedSkillId"
                label={localize(CONFIG.SR3E.WEAPON.linkedskill)}
                value={system.linkedSkillId ?? ""}
                path="system"
                options={skillOptions}
                disabled={!skillOptions.length}
            />
            <LabeledBoolean
                {item}
                key="isDefaulting"
                label={localize(CONFIG.SR3E.WEAPON.isDefaulting)}
                value={system.isDefaulting ?? false}
                path="system"
            />
        {/if}
    </ItemSheetComponent>

    <ItemSheetComponent>
        <h3>{localize(CONFIG.SR3E.WEAPON.weaponStats)}</h3>
        <div class="stat-grid single-column">
            <LabeledDropdown {item} key="mode"           label={localize(CONFIG.SR3E.WEAPON.mode)}           value={system.mode}            path="system" options={kvOptions(CONFIG.SR3E.WEAPON_MODES)} />
            <LabeledDropdown {item} key="damageType"     label={localize(CONFIG.SR3E.WEAPON.damageType)}     value={system.damageType}      path="system" options={kvOptions(CONFIG.SR3E.DAMAGE_TYPES)} />
            <LabeledDropdown {item} key="ammunitionClass" label={localize(CONFIG.SR3E.WEAPON.ammunitionClass)} value={system.ammunitionClass} path="system" options={kvOptions(CONFIG.SR3E.AMMO_CLASSES)} />
            <LabeledDropdown {item} key="reloadMechanism" label={localize(CONFIG.SR3E.WEAPON.reloadMechanism)} value={system.reloadMechanism} path="system" options={kvOptions(CONFIG.SR3E.RELOAD_MECHANISMS)} />
        </div>
        <div class="stat-grid two-column">
            <LabeledNumberInput {item} key="damage"     label={localize(CONFIG.SR3E.WEAPON.damage)}             value={system.damage}     path="system" />
            <LabeledNumberInput {item} key="range"      label={localize(CONFIG.SR3E.WEAPON.range)}              value={system.range}      path="system" />
            <LabeledNumberInput {item} key="recoilComp" label={localize(CONFIG.SR3E.WEAPON.recoilCompensation)} value={system.recoilComp} path="system" />
        </div>
    </ItemSheetComponent>

    <ItemSheetComponent>
        <h3>{localize(CONFIG.SR3E.WEAPON.rangeband)}</h3>
        <div class="stat-grid two-column">
            <LabeledNumberInput {item} key="rangeBand.short"   label={localize(CONFIG.SR3E.WEAPON.rangebandshort)}   value={system.rangeBand?.short}   path="system" />
            <LabeledNumberInput {item} key="rangeBand.medium"  label={localize(CONFIG.SR3E.WEAPON.rangebandmedium)}  value={system.rangeBand?.medium}  path="system" />
            <LabeledNumberInput {item} key="rangeBand.long"    label={localize(CONFIG.SR3E.WEAPON.rangebandlong)}    value={system.rangeBand?.long}    path="system" />
            <LabeledNumberInput {item} key="rangeBand.extreme" label={localize(CONFIG.SR3E.WEAPON.rangebandextreme)} value={system.rangeBand?.extreme} path="system" />
        </div>
    </ItemSheetComponent>

    <GadgetViewer document={item} />
    <Commodity {item} />
    <Portability {item} />
    <JournalViewer document={item} />
</ItemSheetWrapper>
