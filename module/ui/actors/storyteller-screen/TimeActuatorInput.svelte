<script lang="ts">
  let { label, onDelta }: { label: string; onDelta: (n: number) => void } = $props();
  let input = $state("");
</script>

<div class="time-actuator">
  <span class="time-actuator__label">{label}</span>
  <div class="time-actuator__controls">
    <button type="button" aria-label={`Decrement ${label}`} onclick={() => onDelta(-1)}>
      <i class="fa-solid fa-circle-left"></i>
    </button>
    <input
      class="time-actuator__input"
      type="number"
      placeholder="±"
      bind:value={input}
      onblur={(e) => {
        const delta = (e.target as HTMLInputElement).valueAsNumber;
        if (!Number.isNaN(delta) && delta !== 0) onDelta(delta);
        input = "";
      }}
      onkeydown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
    />
    <button type="button" aria-label={`Increment ${label}`} onclick={() => onDelta(1)}>
      <i class="fa-solid fa-circle-right"></i>
    </button>
  </div>
</div>
