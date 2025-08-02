<script>
   import { onMount } from "svelte";
   let {
      value = $bindable(),
      min = $bindable(-Infinity),
      max = $bindable(Infinity),
      onIncrement,
      onDecrement,
   } = $props();
   let editableDiv;

   function increment() {
      value = clampToLimits(value + 1);
   }

   function decrement() {
      value = clampToLimits(value - 1);
   }

   function clampToLimits(val) {
      if (isNaN(val)) return min;
      return Math.min(Math.max(val, min), max);
   }

   function handleDivInput(e) {
      const raw = e.target.textContent.trim();
      const num = Number(raw);
      const valid = !isNaN(num);
      const clamped = clampToLimits(num);

      if (valid) {
         value = clamped;
         e.target.textContent = String(clamped);
      } else {
         // Restore last known valid number
         e.target.textContent = String(value);
      }
   }

   function handleKeydown(e) {
      if (e.key === "ArrowRight" || e.key === "+") {
         e.preventDefault();
         increment();
      } else if (e.key === "ArrowLeft" || e.key === "-") {
         e.preventDefault();
         decrement();
      }
   }

   onMount(() => {
      editableDiv.focus();
      updateDisplay();
   });

   function updateDisplay() {
      editableDiv.textContent = String(value);
   }

   $effect(() => {
      updateDisplay();
   });
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
   class="counter-component"
   role="spinbutton"
   tabindex="0"
   aria-valuemin={min}
   aria-valuemax={max}
   aria-valuenow={value}
   aria-label="Adjust value"
   onkeydown={handleKeydown}
>
   <button
      class="counter-button"
      aria-label="Decrement Value"
      onclick={() => {
         decrement();
         onDecrement?.();
      }}
      tabindex="-1"
      disabled={value <= min}
   >
      <i class="fa-solid fa-minus"></i>
   </button>

   <div
      class="counter-value"
      bind:this={editableDiv}
      contenteditable="true"
      role="textbox"
      aria-label="Value"
      tabindex="-1"
      oninput={handleDivInput}
   >
      {value}
   </div>

   <button
      class="counter-button"
      aria-label="Increment Value"
      onclick={() => {
         increment();
         onIncrement?.();
      }}
      tabindex="-1"
      disabled={value >= max}
   >
      <i class="fa-solid fa-plus"></i>
   </button>
</div>
