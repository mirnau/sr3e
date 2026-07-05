<script lang="ts">
let {
    label,
    className = "no-margin uppercase",
}: {
    label: string;
    className?: string;
} = $props();

function show(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();
    ui.notifications?.info(label);
}
</script>

<h4
    class={className}
    title={label}
    aria-label={label}
    oncontextmenu={show}
>
    {label}
</h4>
