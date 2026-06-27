<script lang="ts">
import { onDestroy, onMount, untrack } from "svelte";
import { localize } from "../../services/utilities";
import Image from "../common-components/Image.svelte";
import ItemSheetComponent from "../common-components/ItemSheetComponent.svelte";
import ItemSheetWrapper from "../common-components/ItemSheetWrapper.svelte";
import StatCard from "../common-components/StatCard.svelte";
import ComboSearch from "../common-components/ComboSearch.svelte";
import Commodity from "../common-components/Commodity.svelte";
import Portability from "../common-components/Portability.svelte";
import JournalViewer from "../common-components/JournalViewer.svelte";

const p = $props<{ item: Item }>();
const item = untrack(() => p.item);
const system = item.system as Record<string, any>;

let name = $state(item.name as string);
let comboSearchValue = $state<string>(system.linkedSkillId ?? "");
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

        for (let i = 0; i < specializations.length; i++) {
            result.push({ value: `${skill.id}::${i}`, label: `${baseLabel} — ${specializations[i].name}` });
        }
    }

    skillOptions = result;
}

function onSkillSelect(value: string) {
    comboSearchValue = value;
    item.update({ "system.linkedSkillId": value }, { render: false } as any);
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

const weaponEntries = [
    { key: "damage",     label: localize(CONFIG.SR3E.WEAPON.damage),             value: system.damage,     path: "system", type: "number" as const },
    { key: "range",      label: localize(CONFIG.SR3E.WEAPON.range),              value: system.range,      path: "system", type: "number" as const },
    { key: "recoilComp", label: localize(CONFIG.SR3E.WEAPON.recoilCompensation), value: system.recoilComp, path: "system", type: "number" as const },
];

const rangeBandEntries = [
    { key: "rangeBand.short",   label: localize(CONFIG.SR3E.WEAPON.rangebandshort),   value: system.rangeBand?.short,   path: "system", type: "number" as const },
    { key: "rangeBand.medium",  label: localize(CONFIG.SR3E.WEAPON.rangebandmedium),  value: system.rangeBand?.medium,  path: "system", type: "number" as const },
    { key: "rangeBand.long",    label: localize(CONFIG.SR3E.WEAPON.rangebandlong),    value: system.rangeBand?.long,    path: "system", type: "number" as const },
    { key: "rangeBand.extreme", label: localize(CONFIG.SR3E.WEAPON.rangebandextreme), value: system.rangeBand?.extreme, path: "system", type: "number" as const },
];
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
            <div class="stat-card">
                <div class="stat-card-background"></div>
                <h3>Skill for resolving rolls</h3>
                <ComboSearch
                    bind:value={comboSearchValue}
                    options={skillOptions}
                    placeholder="Select linked skill..."
                    nomatchplaceholder="No matching skill"
                    disabled={!skillOptions.length}
                    onselect={onSkillSelect}
                />
                <label class="inline-checkbox">
                    <input
                        type="checkbox"
                        checked={system.isDefaulting}
                        onchange={(e) => item.update({ "system.isDefaulting": (e.target as HTMLInputElement).checked }, { render: false })}
                    />
                    {localize("sr3e.common.isdefaulting")}
                </label>
            </div>
        {/if}
    </ItemSheetComponent>

    <ItemSheetComponent>
        <h3>{localize(CONFIG.SR3E.WEAPON.weaponStats)}</h3>
        <div class="stat-grid single-column">
            <StatCard {item} key="mode"           label={localize(CONFIG.SR3E.WEAPON.mode)}           value={system.mode}           path="system" type="select" options={kvOptions(CONFIG.SR3E.WEAPON_MODES)} />
            <StatCard {item} key="damageType"      label={localize(CONFIG.SR3E.WEAPON.damageType)}     value={system.damageType}     path="system" type="select" options={kvOptions(CONFIG.SR3E.DAMAGE_TYPES)} />
            <StatCard {item} key="ammunitionClass" label={localize(CONFIG.SR3E.WEAPON.ammunitionClass)} value={system.ammunitionClass} path="system" type="select" options={kvOptions(CONFIG.SR3E.AMMO_CLASSES)} />
            <StatCard {item} key="reloadMechanism" label={localize(CONFIG.SR3E.WEAPON.reloadMechanism)} value={system.reloadMechanism} path="system" type="select" options={kvOptions(CONFIG.SR3E.RELOAD_MECHANISMS)} />
        </div>
        <div class="stat-grid two-column">
            {#each weaponEntries as entry}
                <StatCard {item} {...entry} />
            {/each}
        </div>
    </ItemSheetComponent>

    <ItemSheetComponent>
        <h3>{localize(CONFIG.SR3E.WEAPON.rangeband)}</h3>
        <div class="stat-grid two-column">
            {#each rangeBandEntries as entry}
                <StatCard {item} {...entry} />
            {/each}
        </div>
    </ItemSheetComponent>

    <Commodity {item} />
    <Portability {item} />
    <JournalViewer document={item} />
</ItemSheetWrapper>
