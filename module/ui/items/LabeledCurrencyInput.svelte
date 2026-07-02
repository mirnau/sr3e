<script lang="ts">
import SR3EItem from "../../documents/SR3EItem";

const p = $props<{
    item?: SR3EItem;
    key: string;
    label: string;
    value: number;
    path?: string;
    onUpdate?: (val: number) => void;
    disabled?: boolean;
}>();

let displayValue = $state("");

$effect(() => {
    displayValue = formatCurrency(p.value ?? 0);
});

function formatCurrency(amount: number): string {
    return `${Math.trunc(amount).toLocaleString("de-DE")} \u00a5`;
}

function parseCurrency(raw: string): number {
    return parseInt(raw.replace(/[^\d]/g, ""), 10) || 0;
}

function commit(value: number) {
    if (p.onUpdate) {
        p.onUpdate(value);
    } else if (p.item && p.path) {
        (p.item as any).update({ [`${p.path}.${p.key}`]: value }, { render: false });
    }
}

function onInput(e: Event) {
    displayValue = formatCurrency(parseCurrency((e.target as HTMLInputElement).value));
}

function onBlur() {
    const parsed = parseCurrency(displayValue);
    displayValue = formatCurrency(parsed);
    commit(parsed);
}

function onFocus(e: Event) {
    (e.target as HTMLInputElement).select();
}

function onKeydown(e: KeyboardEvent) {
    const allowed = ["Backspace", "Tab", "Enter", "Escape", "Delete", "ArrowLeft", "ArrowRight", "Home", "End"];
    if (allowed.includes(e.key) || (e.ctrlKey && ["a", "c", "v", "x"].includes(e.key.toLowerCase()))) return;
    if (!/^\d$/.test(e.key)) e.preventDefault();
}
</script>

<div class="stat-card stat-field-card labeled-field-card labeled-currency-input" class:inactive={p.disabled}>
    <div class="stat-card-background"></div>
    <div class="title-container">
        <h4 class="no-margin uppercase">{p.label}</h4>
    </div>
    <div class="select-wrapper currency-wrapper">
        <div class="select-background"></div>
        <input
            type="text"
            value={displayValue}
            oninput={onInput}
            onblur={onBlur}
            onfocus={onFocus}
            onkeydown={onKeydown}
            disabled={p.disabled}
        />
    </div>
</div>
