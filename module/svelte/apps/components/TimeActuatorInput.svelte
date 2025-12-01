<script lang="ts">
    const { label = "Seconds", onDelta = () => {} } = $props();
    let input = $state("");
</script>

<div class="stat-card">
    <div class="stat-card-background"></div>
    <h1>{label}</h1>
    <div class="time-editor-component">
        <button
            type="button"
            aria-label={`Decrement ${label}`}
            onclick={() => onDelta(-1)}
        >
            <i class="fa-solid fa-circle-left"></i>
        </button>
        <input
            class="time-display"
            type="number"
            placeholder={`± ${label.toLowerCase()}`}
            bind:value={input}
            onblur={(e) => {
                const delta = e.target.valueAsNumber;
                if (!Number.isNaN(delta) && delta !== 0) {
                    onDelta(delta);
                }
                input = "";
            }}
            onkeydown={(e) => {
                if (e.key === "Enter") e.target.blur();
            }}
        />
        <button
            type="button"
            aria-label={`Increment ${label}`}
            onclick={() => onDelta(1)}
        >
            <i class="fa-solid fa-circle-right"></i>
        </button>
    </div>
</div>
