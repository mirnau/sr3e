<script lang="ts">
import { untrack } from "svelte";
import { localize } from "../../services/utilities";
import Image from "../common-components/Image.svelte";
import ItemSheetComponent from "../common-components/ItemSheetComponent.svelte";
import ItemSheetWrapper from "../common-components/ItemSheetWrapper.svelte";
import LabeledDropdown from "./LabeledDropdown.svelte";
import LabeledNumberInput from "./LabeledNumberInput.svelte";
import LabeledBoolean from "./LabeledBoolean.svelte";
import FuzzyFinder from "../common-components/FuzzyFinder.svelte";
import JournalViewer from "../common-components/JournalViewer.svelte";

const p = $props<{ item: Item }>();
const item = untrack(() => p.item);
const system = item.system as Record<string, any>;

let name = $state(item.name as string);
let formattedAmount = $state(formatAmount(system.amount));
let creditorId = $state<string>(system.creditorId ?? "");
let creditorOptions = $state<{ value: string; label: string }[]>([]);

function kvOptions(map: Record<string, string>) {
    return Object.entries(map).map(([value, token]) => ({ value, label: localize(token) }));
}

function formatAmount(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " ¥";
}

function onAmountInput(e: Event) {
    const raw = (e.target as HTMLInputElement).value.replace(/[^\d]/g, "");
    const parsed = parseInt(raw, 10) || 0;
    (e.target as HTMLInputElement).value = formatAmount(parsed);
}

function onAmountBlur(e: Event) {
    const raw = (e.target as HTMLInputElement).value.replace(/[^\d]/g, "");
    const parsed = parseInt(raw, 10) || 0;
    formattedAmount = formatAmount(parsed);
    item.update({ "system.amount": parsed }, { render: false } as any);
}

function onAmountFocus(e: Event) {
    (e.target as HTMLInputElement).select();
}

function onAmountKeydown(e: KeyboardEvent) {
    const allowed = [8, 9, 13, 27, 46];
    if (allowed.includes(e.keyCode)) return;
    if (e.ctrlKey && [65, 67, 86, 88].includes(e.keyCode)) return;
    if (e.keyCode >= 35 && e.keyCode <= 39) return;
    if ((e.shiftKey || e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
        e.preventDefault();
    }
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
            <div class="stat-card stat-field-card labeled-field-card">
                <div class="stat-card-background"></div>
                <div class="title-container">
                    <h4 class="no-margin uppercase">{localize(CONFIG.SR3E.TRANSACTION.amount)}</h4>
                </div>
                <input
                    type="text"
                    value={formattedAmount}
                    oninput={onAmountInput}
                    onblur={onAmountBlur}
                    onfocus={onAmountFocus}
                    onkeydown={onAmountKeydown}
                />
            </div>
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
