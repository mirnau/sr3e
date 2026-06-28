<script lang="ts">
import { untrack } from "svelte";
import { localize } from "../../services/utilities";
import StatCard from "./StatCard.svelte";
import LabeledNumberInput from "../items/LabeledNumberInput.svelte";
import LabeledBoolean from "../items/LabeledBoolean.svelte";
import ItemSheetComponent from "./ItemSheetComponent.svelte";

const p = $props<{ item: Item }>();
const item = untrack(() => p.item);
const commodity = (item.system as any).commodity;

function kvOptions(map: Record<string, string>) {
    return Object.entries(map).map(([value, token]) => ({ value, label: localize(token) }));
}


const legalityEntries = [
    {
        key: "status",   label: localize(CONFIG.SR3E.COMMODITY.legalstatus),              value: commodity.legality?.status,
        path: "system.commodity.legality", type: "select" as const, options: kvOptions(CONFIG.SR3E.LEGAL_STATUSES),
        placeholder: localize("sr3e.placeholders.selectlegalstatus"),
    },
    {
        key: "permit",   label: localize(CONFIG.SR3E.COMMODITY.legalpermit),              value: commodity.legality?.permit,
        path: "system.commodity.legality", type: "select" as const, options: kvOptions(CONFIG.SR3E.LEGAL_PERMITS),
    },
    {
        key: "priority", label: localize(CONFIG.SR3E.COMMODITY.legalenforcementpriority), value: commodity.legality?.priority,
        path: "system.commodity.legality", type: "select" as const, options: kvOptions(CONFIG.SR3E.LEGAL_PRIORITIES),
    },
];
</script>

<ItemSheetComponent>
    <h3>{localize(CONFIG.SR3E.COMMODITY.commodity)}</h3>
    <div class="stat-grid two-column">
        <LabeledNumberInput {item} key="days"        label={localize(CONFIG.SR3E.COMMODITY.days)}        value={commodity.days}        path="system.commodity" />
        <LabeledNumberInput {item} key="cost"        label={localize(CONFIG.SR3E.COMMODITY.cost)}        value={commodity.cost}        path="system.commodity" />
        <LabeledNumberInput {item} key="streetIndex" label={localize(CONFIG.SR3E.COMMODITY.streetIndex)} value={commodity.streetIndex} path="system.commodity" />
        <LabeledBoolean {item} key="isBroken" label={localize(CONFIG.SR3E.COMMODITY.isBroken)} value={commodity.isBroken} path="system.commodity" />
    </div>
    <div class="stat-grid single-column">
        {#each legalityEntries as entry}
            <StatCard {item} {...entry} />
        {/each}
    </div>
</ItemSheetComponent>
