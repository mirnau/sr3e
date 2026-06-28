<script lang="ts">
import SR3EItem from "../../documents/SR3EItem";

let {
    item,
    key,
    label,
    value,
    path,
    onUpdate,
    disabled = false,
}: {
    item?: SR3EItem;
    key: string;
    label: string;
    value: number;
    path?: string;
    onUpdate?: (val: number) => void;
    disabled?: boolean;
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

<div class="stat-card stat-field-card" class:inactive={disabled}>
    <div class="stat-card-background"></div>
    <div class="title-container">
        <h4 class="no-margin uppercase">{label}</h4>
    </div>
    <div class="select-wrapper narrow">
        <div class="select-background"></div>
        <input type="number" value={value ?? 0} onchange={onChange} {disabled} />
    </div>
</div>
