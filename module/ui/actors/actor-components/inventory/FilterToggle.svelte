<script lang="ts">
let {
    checked = $bindable(false),
    label = "",
    svgName = "",
    letter = "",
    disabled = false,
    onChange = null as ((e: { target: { checked: boolean } }) => void) | null,
}: {
    checked?: boolean;
    label?: string;
    svgName?: string;
    letter?: string;
    disabled?: boolean;
    onChange?: ((e: { target: { checked: boolean } }) => void) | null;
} = $props();

let icon = $state("");

$effect(async () => {
    if (!svgName) { icon = ""; return; }
    try {
        const res = await fetch(`systems/sr3e/textures/svgrepo/${svgName}`);
        icon = await res.text();
    } catch {
        icon = "";
    }
});

function handleToggle() {
    if (disabled) return;
    checked = !checked;
    onChange?.({ target: { checked } });
}

function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleToggle();
    }
}
</script>

<div
    class="toggle-card button"
    class:disabled
    role="checkbox"
    aria-checked={checked}
    aria-disabled={disabled}
    aria-label={label || "Toggle"}
    tabindex={disabled ? -1 : 0}
    onclick={handleToggle}
    onkeydown={handleKeyDown}
>
    <div class="stat-card-background"></div>
    {#if letter}
        <span class="svg-wrapper letter-icon" data-active={checked}>{letter}</span>
    {:else}
        <span class="svg-wrapper" data-active={checked}>
            {@html icon}
        </span>
    {/if}
    {#if label}
        <h6 class="no-margin uppercase">{label}</h6>
    {/if}
</div>
