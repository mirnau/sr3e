<script>
   import { onMount } from "svelte";
   let { value = $bindable(), min, max } = $props();
   let editableDiv;

   function increment() {
      const newValue = value + 1;
      value = max !== undefined && newValue > max ? max : newValue;
      updateDiv();
   }

   function decrement() {
      const newValue = value - 1;
      value = min !== undefined && newValue < min ? min : newValue;
      updateDiv();
   }

   function updateDiv() {
      editableDiv.textContent = value;
   }

   function handleDivInput(e) {
      const newValue = parseInt(e.target.textContent);
      const clampedValue = clampToLimits(newValue);
      value = clampedValue;
      e.target.textContent = clampedValue;
   }

   function clampToLimits(val) {
      let result = val;
      if (min !== undefined && result < min) result = min;
      if (max !== undefined && result > max) result = max;
      return result;
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
   });

   $effect(() => {
      updateDiv();
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
   <button class="counter-button" aria-label="Decrement Value" onclick={decrement} tabindex="-1">
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

   <button class="counter-button" aria-label="Increment Value" onclick={increment} tabindex="-1">
      <i class="fa-solid fa-plus"></i>
   </button>
</div>
