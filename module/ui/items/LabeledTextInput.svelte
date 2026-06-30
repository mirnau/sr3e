<script lang="ts">
import SR3EItem from "../../documents/SR3EItem";

let {
    item,
    key,
    label,
    value,
    path,
    placeholder,
    onUpdate,
    disabled = false,
}: {
    item?: SR3EItem;
    key: string;
    label: string;
    value: string;
    path?: string;
    placeholder?: string;
    onUpdate?: (val: string) => void;
    disabled?: boolean;
} = $props();

function onChange(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    if (onUpdate) {
        onUpdate(val);
    } else if (item && path) {
        (item as any).update({ [`${path}.${key}`]: val }, { render: false });
    }
}
</script>

<div class="stat-card stat-field-card labeled-field-card labeled-text-input" class:inactive={disabled}>
    <div class="stat-card-background"></div>
    <div class="title-container">
        <h4 class="no-margin uppercase">{label}</h4>
    </div>
    <div class="select-wrapper">
        <div class="select-background"></div>
        <input type="text" value={value ?? ""} onchange={onChange} {placeholder} {disabled} />
    </div>
</div>
