<script>
   import { onMount } from "svelte";
   import Counter from "../components/basic/Counter.svelte";
   import ItemDataService from "../../../services/ItemDataService.js";
   let { actor, config } = $props();

   let targetNumber = $state(5);
   let difficulty = $state("");
   let boundValue = $state(5);

   function Reset() {}
   function Submit() {}

   onMount(() => {
      const first = containerEl.querySelector(".counter-component[tabindex='0']");
      if (first) first.focus();
   });

   let containerEl;

   let difficulties = ItemDataService.getDifficultieGradings(config);

   console.log(difficulties);

   $effect(() => {
      if (!difficulties) return;

      const tn = Number(targetNumber); // guaranteed to be a number, but be safe

      if (tn === 2) {
         difficulty = difficulties.simple;
      } else if (tn === 3) {
         difficulty = difficulties.routine;
      } else if (tn === 4) {
         difficulty = difficulties.average;
      } else if (tn === 5) {
         difficulty = difficulties.challenging;
      } else if (tn === 6 || tn === 7) {
         difficulty = difficulties.hard;
      } else if (tn === 8) {
         difficulty = difficulties.strenuous;
      } else if (tn === 9) {
         difficulty = difficulties.extreme;
      } else if (tn >= 10) {
         difficulty = difficulties.nearlyimpossible;
      }
   });

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

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
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
   <Counter bind:value={targetNumber} min="2" />
   <h4 class="no-margin">{difficulty}</h4>
   <h1 class="no-margin">Modifiers</h1>
   <Counter bind:value={boundValue} />
   <button class="regular" type="reset" onclick={Reset}>Clear</button>
   <button class="regular" type="submit" onclick={Submit}>Roll!</button>
</div>
