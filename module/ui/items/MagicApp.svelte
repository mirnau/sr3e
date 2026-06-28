<script lang="ts">
import { untrack } from "svelte";
import { localize } from "../../services/utilities";
import Image from "../common-components/Image.svelte";
import ItemSheetComponent from "../common-components/ItemSheetComponent.svelte";
import ItemSheetWrapper from "../common-components/ItemSheetWrapper.svelte";
import StatCard from "../common-components/StatCard.svelte";
import JournalViewer from "../common-components/JournalViewer.svelte";
import LabeledDropdown from "./LabeledDropdown.svelte";

const p = $props<{ item: Item }>();
const item = untrack(() => p.item);
const system = item.system as Record<string, any>;
const awakened     = system.awakened    as { archetype: string; priority: string };
const magicianData = system.magicianData as {
    magicianType: string;
    tradition: string;
    drainResistanceAttribute: string;
    aspect: string;
    canAstrallyProject: boolean;
    totem: string;
    spellPoints: number;
};
const adeptData = system.adeptData as { powerPoints: number };

let name = $state(item.name as string);

// $state for the three fields that gate visibility — render:false in StatCard
// suppresses remounting, so these must be local reactive state.
let archetype    = $state(awakened.archetype as string);
let magicianType = $state(magicianData.magicianType as string);
let tradition    = $state(magicianData.tradition as string);

const isMagician = $derived(archetype === "magician");
const isAdept    = $derived(archetype === "adept");
const isAspected = $derived(isMagician && magicianType === "aspectedmage");
const isShamanic = $derived(isMagician && tradition === "shamanic");
const canProject = $derived(isMagician && !isAspected);

function kvOptions(map: Record<string, string>) {
    return Object.entries(map).map(([value, token]) => ({ value, label: localize(token) }));
}

function onArchetypeChange(val: string) {
    archetype = val;
    (item as any).update({ "system.awakened.archetype": val }, { render: false });
}

function onMagicianTypeChange(val: string) {
    magicianType = val;
    (item as any).update({ "system.magicianData.magicianType": val }, { render: false });
}

function onTraditionChange(val: string) {
    tradition = val;
    (item as any).update({ "system.magicianData.tradition": val }, { render: false });
}
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
        <LabeledDropdown {item} key="archetype" label={localize(CONFIG.SR3E.MAGIC.archetype)} value={archetype}         path="system.awakened" options={kvOptions(CONFIG.SR3E.ARCHETYPES)}                             onUpdate={onArchetypeChange} />
        <LabeledDropdown {item} key="priority"  label={localize(CONFIG.SR3E.MAGIC.priority)}  value={awakened.priority} path="system.awakened" options={["A", "B"].map(v => ({ value: v, label: v }))} />
    </ItemSheetComponent>

    <ItemSheetComponent>
        <LabeledDropdown {item} key="magicianType" label={localize(CONFIG.SR3E.MAGIC.magicianType)} value={magicianType} path="system.magicianData" options={kvOptions(CONFIG.SR3E.MAGICIAN_TYPES)} onUpdate={onMagicianTypeChange} disabled={!isMagician} />
    </ItemSheetComponent>

    <ItemSheetComponent>
        <LabeledDropdown {item} key="tradition" label={localize(CONFIG.SR3E.MAGIC.tradition)} value={tradition} path="system.magicianData" options={kvOptions(CONFIG.SR3E.TRADITIONS)} onUpdate={onTraditionChange} disabled={!isMagician} />
    </ItemSheetComponent>

    <ItemSheetComponent>
        <LabeledDropdown {item} key="aspect" label={localize(CONFIG.SR3E.MAGIC.aspect)} value={magicianData.aspect} path="system.magicianData" options={kvOptions(CONFIG.SR3E.ASPECTS)} disabled={!isAspected} />
    </ItemSheetComponent>

    <ItemSheetComponent>
        <LabeledDropdown {item} key="drainResistanceAttribute" label={localize(CONFIG.SR3E.MAGIC.drainResistanceAttribute)} value={magicianData.drainResistanceAttribute} path="system.magicianData" options={kvOptions(CONFIG.SR3E.RESISTANCE_ATTRIBUTES)} disabled={!isMagician} />
    </ItemSheetComponent>

    <ItemSheetComponent>
        <StatCard {item} key="canAstrallyProject" label={localize(CONFIG.SR3E.MAGIC.canAstrallyProject)} value={magicianData.canAstrallyProject} path="system.magicianData" type="checkbox" disabled={!canProject} />
    </ItemSheetComponent>

    <ItemSheetComponent>
        <StatCard {item} key="totem" label={localize(CONFIG.SR3E.MAGIC.totem)} value={magicianData.totem} path="system.magicianData" type="text" placeholder={localize(CONFIG.SR3E.MAGIC.shamannote)} disabled={!isShamanic} />
    </ItemSheetComponent>

    <ItemSheetComponent>
        <StatCard {item} key="spellPoints" label={localize(CONFIG.SR3E.MAGIC.spellPoints)} value={magicianData.spellPoints} path="system.magicianData" type="number" disabled={!isMagician} />
    </ItemSheetComponent>

    <ItemSheetComponent>
        <StatCard {item} key="powerPoints" label={localize(CONFIG.SR3E.MAGIC.powerPoints)} value={adeptData.powerPoints} path="system.adeptData" type="number" disabled={!isAdept} />
    </ItemSheetComponent>

    <JournalViewer document={item} />
</ItemSheetWrapper>
