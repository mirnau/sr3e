<script lang="ts">
import { untrack } from "svelte";
import { localize } from "../../services/utilities";
import Image from "../common-components/Image.svelte";
import ItemSheetComponent from "../common-components/ItemSheetComponent.svelte";
import ItemSheetWrapper from "../common-components/ItemSheetWrapper.svelte";
import LabeledDropdown from "./LabeledDropdown.svelte";
import LabeledCurrencyInput from "./LabeledCurrencyInput.svelte";
import LabeledNumberInput from "./LabeledNumberInput.svelte";
import LabeledBoolean from "./LabeledBoolean.svelte";
import FuzzyFinder from "../common-components/FuzzyFinder.svelte";
import JournalViewer from "../common-components/JournalViewer.svelte";

const p = $props<{ item: Item }>();
const item = untrack(() => p.item);
const system = item.system as Record<string, any>;

let name = $state(item.name as string);
let creditorId = $state<string>(system.creditorId ?? "");
let creditorOptions = $state<{ value: string; label: string }[]>([]);

function kvOptions(map: Record<string, string>) {
    return Object.entries(map).map(([value, token]) => ({ value, label: localize(token) }));
}

$effect(() => {
    const actors = (game as any).actors.filter((a: any) =>
        a.type === "character" && ((game as any).user.isGM || a.testUserPermission((game as any).user, "OBSERVER"))
    );
    creditorOptions = actors.map((a: any) => ({ value: a.id, label: a.name }));
});
</script>

<ItemSheetWrapper csslayout="single">
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
        <h3>{localize(CONFIG.SR3E.TRANSACTION.transaction)}</h3>
        <div class="stat-grid single-column">
            <LabeledCurrencyInput {item} key="amount" label={localize(CONFIG.SR3E.TRANSACTION.amount)} value={system.amount} path="system" />
            <LabeledDropdown    {item} key="type"            label={localize(CONFIG.SR3E.TRANSACTION.type)}            value={system.type}            path="system" options={kvOptions(CONFIG.SR3E.TRANSACTION_TYPES)} />
            <LabeledNumberInput {item} key="interestPerMonth" label={localize(CONFIG.SR3E.TRANSACTION.interestpermonth)} value={system.interestPerMonth} path="system" />
        </div>
        <div class="stat-grid two-column">
            <LabeledBoolean {item} key="recurrent"    label={localize(CONFIG.SR3E.TRANSACTION.recurrent)}   value={system.recurrent}    path="system" />
            <LabeledBoolean {item} key="isCreditStick" label={localize(CONFIG.SR3E.TRANSACTION.creditstick)} value={system.isCreditStick} path="system" />
        </div>
    </ItemSheetComponent>

    {#if system.type !== "asset"}
        <ItemSheetComponent>
            <h3>{localize(CONFIG.SR3E.TRANSACTION.creditor)}</h3>
            <FuzzyFinder
                bind:value={creditorId}
                options={creditorOptions}
                placeholder={localize(CONFIG.SR3E.TRANSACTION.creditor)}
                nomatchtext="No matching actor"
                onselect={(id) => item.update({ "system.creditorId": id }, { render: false } as any)}
            />
        </ItemSheetComponent>
    {/if}

    <JournalViewer document={item} />
</ItemSheetWrapper>
