<script lang="ts">
import SR3EItem from "../../documents/SR3EItem";
import FieldLabel from "../common-components/FieldLabel.svelte";
import Switch from "../common-components/Switch.svelte";

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
    value: boolean;
    path?: string;
    onUpdate?: (val: boolean) => void;
    disabled?: boolean;
} = $props();

function onChange(e: Event) {
    const val = (e.target as HTMLInputElement).checked;
    if (onUpdate) {
        onUpdate(val);
    } else if (item && path) {
        (item as any).update({ [`${path}.${key}`]: val }, { render: false });
    }
}
</script>

<div class="stat-card stat-field-card labeled-field-card labeled-boolean" class:inactive={disabled}>
    <div class="stat-card-background"></div>
    <div class="title-container">
        <FieldLabel {label} />
    </div>
    <Switch checked={value} ariaLabel={label} {onChange} {disabled} />
</div>
