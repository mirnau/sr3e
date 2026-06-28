<script lang="ts">
let {
    checked = $bindable(false),
    label = "",
    svgName = "",
    disabled = false,
    onChange = null as ((e: { target: { checked: boolean } }) => void) | null,
}: {
    checked?: boolean;
    label?: string;
    svgName?: string;
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
    role="checkbox"
    aria-checked={checked}
    aria-label={label || "Toggle"}
    tabindex="0"
    onclick={handleToggle}
    onkeydown={handleKeyDown}
>
    <div class="stat-card-background"></div>
    <span class="svg-wrapper" data-active={checked}>
        {@html icon}
    </span>
    {#if label}
        <h6 class="no-margin uppercase">{label}</h6>
    {/if}
</div>
