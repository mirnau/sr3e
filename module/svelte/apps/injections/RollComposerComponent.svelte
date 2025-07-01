<script>
   import { onMount } from "svelte";
   import Counter from "../components/basic/Counter.svelte";
   let { actor, config } = $props();

   let boundValue = $state(5);

   function Reset() {}
   function Submit() {}

   onMount(() => {
      const first = containerEl.querySelector(".counter-component[tabindex='0']");
      if (first) first.focus();
   });

   let containerEl;

   function trapFocus(e) {
      if (e.key !== "Tab") return;

      const focusables = Array.from(containerEl.querySelectorAll(".counter-component[tabindex='0'], button[type]"));

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (focusables.length === 0) return;

      if (e.shiftKey && document.activeElement === first) {
         e.preventDefault();
         last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
         e.preventDefault();
         first.focus();
      }
   }
</script>

<div
   class="roll-composer-container"
   bind:this={containerEl}
   role="group"
   tabindex="-1"
   onkeydown={(e) => {
      e.stopPropagation();
      trapFocus(e);
   }}
>
   <h1 class="no-margin">Target Number</h1>
   <Counter bind:value={boundValue} />
   <h1 class="no-margin">Modifiers</h1>
   <Counter bind:value={boundValue} />
   <button type="reset" onclick={Reset}>Clear</button>
   <button type="submit" onclick={Submit}>Roll!</button>
</div>
