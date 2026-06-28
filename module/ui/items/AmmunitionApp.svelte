<script lang="ts">
import { untrack } from "svelte";
import { localize } from "../../services/utilities";
import Image from "../common-components/Image.svelte";
import ItemSheetComponent from "../common-components/ItemSheetComponent.svelte";
import ItemSheetWrapper from "../common-components/ItemSheetWrapper.svelte";
import StatCard from "../common-components/StatCard.svelte";
import LabeledNumberInput from "./LabeledNumberInput.svelte";
import Commodity from "../common-components/Commodity.svelte";
import Portability from "../common-components/Portability.svelte";
import JournalViewer from "../common-components/JournalViewer.svelte";

const p = $props<{ item: Item }>();
const item = untrack(() => p.item);
const system = item.system as Record<string, any>;

let name = $state(item.name as string);

function kvOptions(map: Record<string, string>) {
    return Object.entries(map).map(([value, token]) => ({ value, label: localize(token) }));
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
    </ItemSheetComponent>

    <ItemSheetComponent>
        <h3>{localize(CONFIG.SR3E.AMMUNITION.ammunition)}</h3>
        <div class="stat-grid single-column">
            <StatCard {item} key="class"           label={localize(CONFIG.SR3E.AMMUNITION.class)}           value={system.class}           path="system" type="select" options={kvOptions(CONFIG.SR3E.AMMO_CLASSES)} />
            <StatCard {item} key="type"            label={localize(CONFIG.SR3E.AMMUNITION.type)}            value={system.type}            path="system" type="select" options={kvOptions(CONFIG.SR3E.AMMO_TYPES)} />
            <StatCard {item} key="reloadMechanism" label={localize(CONFIG.SR3E.WEAPON.reloadMechanism)}     value={system.reloadMechanism} path="system" type="select" options={kvOptions(CONFIG.SR3E.RELOAD_MECHANISMS)} />
        </div>
        <div class="stat-grid two-column">
            <LabeledNumberInput {item} key="rounds"      label={localize(CONFIG.SR3E.AMMUNITION.rounds)}      value={system.rounds}      path="system" />
            <LabeledNumberInput {item} key="maxCapacity" label={localize(CONFIG.SR3E.AMMUNITION.maxcapacity)} value={system.maxCapacity} path="system" />
        </div>
    </ItemSheetComponent>

    <Commodity {item} />
    <Portability {item} />
    <JournalViewer document={item} />
</ItemSheetWrapper>
