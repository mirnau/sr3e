<script lang="ts">
  let { label, value, onIncrement, onDecrement, onSet }: {
    label: string;
    value: number;
    onIncrement: () => void;
    onDecrement: () => void;
    onSet: (n: number) => void;
  } = $props();
</script>

<div class="time-actuator">
  <div class="time-actuator__background"></div>
  <span class="time-actuator__label">{label}</span>
  <div class="skill-main-container">
    <button class="attr-chevron" type="button" aria-label={`Decrement ${label}`} onclick={onDecrement}>
      <i class="fa-solid fa-chevron-left"></i>
    </button>
    <input
      class="time-actuator__input"
      type="number"
      value={value}
      onblur={(e) => {
        const v = (e.target as HTMLInputElement).valueAsNumber;
        if (!Number.isNaN(v)) onSet(v);
      }}
      onkeydown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
    />
    <button class="attr-chevron" type="button" aria-label={`Increment ${label}`} onclick={onIncrement}>
      <i class="fa-solid fa-chevron-right"></i>
    </button>
  </div>
</div>
