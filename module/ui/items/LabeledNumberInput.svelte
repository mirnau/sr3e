<script lang="ts">
import SR3EItem from "../../documents/SR3EItem";
import FieldLabel from "../common-components/FieldLabel.svelte";

let {
    item,
    key,
    label,
    value,
    path,
    onUpdate,
    disabled = false,
    step = "1",
}: {
    item?: SR3EItem;
    key: string;
    label: string;
    value: number;
    path?: string;
    onUpdate?: (val: number) => void;
    disabled?: boolean;
    step?: string;
} = $props();

function onChange(e: Event) {
    const val = parseFloat((e.target as HTMLInputElement).value);
    if (onUpdate) {
        onUpdate(val);
    } else if (item && path) {
        (item as any).update({ [`${path}.${key}`]: val }, { render: false });
    }
}
</script>

<div class="stat-card stat-field-card labeled-field-card" class:inactive={disabled}>
    <div class="stat-card-background"></div>
    <div class="title-container">
        <FieldLabel {label} />
    </div>
    <div class="select-wrapper narrow">
        <div class="select-background"></div>
        <input type="number" {step} value={value ?? 0} onchange={onChange} {disabled} />
    </div>
</div>
