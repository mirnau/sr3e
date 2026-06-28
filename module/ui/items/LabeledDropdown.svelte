<script lang="ts">
import SR3EItem from "../../documents/SR3EItem";

let {
    item,
    key,
    label,
    value,
    path,
    options,
    onUpdate,
    disabled = false,
}: {
    item?: SR3EItem;
    key: string;
    label: string;
    value: string;
    path?: string;
    options: { value: string; label: string }[];
    onUpdate?: (val: string) => void;
    disabled?: boolean;
} = $props();

function onChange(e: Event) {
    const val = (e.target as HTMLSelectElement).value;
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
        <h4 class="no-margin uppercase">{label}</h4>
    </div>
    <div class="select-wrapper">
        <div class="select-background"></div>
        <select value={value ?? ""} onchange={onChange} {disabled}>
            <option value="" disabled selected={value == null || value === ""} hidden>
                {game.i18n.localize("sr3e.placeholders.selectanoption")}
            </option>
            {#each options as option}
                <option value={option.value} selected={value === option.value}>
                    {option.label}
                </option>
            {/each}
        </select>
    </div>
</div>
