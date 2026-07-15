<script lang="ts">
import FieldLabel from "../common-components/FieldLabel.svelte";
import Switch from "../common-components/Switch.svelte";

let {
    label,
    checked,
    value,
    onChange,
    disabled = false,
}: {
    label: string;
    checked: boolean;
    value?: number;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
} = $props();

function handleChange(e: Event) {
    onChange((e.target as HTMLInputElement).checked);
}
</script>

<div class="stat-card stat-field-card labeled-field-card labeled-boolean" class:inactive={disabled}>
    <div class="stat-card-background"></div>
    <div class="title-container">
        <FieldLabel {label} />
    </div>
    {#if value !== undefined}
        <span class="skill-random-value">{value}</span>
    {/if}
    <Switch {checked} ariaLabel={label} onChange={handleChange} {disabled} />
</div>
