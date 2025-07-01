<script>
   import { onMount } from "svelte";
   import Counter from "../components/basic/Counter.svelte";
   import ItemDataService from "../../../services/ItemDataService.js";

   let { actor, config } = $props();

   let targetNumber = $state(5);
   let modifiers = $state(0);
   let karmaCost = $state(0);
   let diceBought = $state(0);
   let difficulty = $state("");
   let isDefaultingAsString = $state("false");
   let isDefaulting = $state(false);

   let containerEl;
   let selectEl;
   let focusables = [];

   let difficulties = ItemDataService.getDifficultieGradings(config);

   onMount(() => {
      focusables = Array.from(
         containerEl.querySelectorAll("select, .counter-component[tabindex='0'], button[type]")
      );
      selectEl?.focus();
   });

   function karmaCostCalculator() {
      karmaCost = 0.5 * diceBought * (diceBought + 1);
   }

   $effect(() => {
      isDefaulting = isDefaultingAsString === "true";
   });

   $effect(() => {
      const tn = Number(targetNumber);
      if (!difficulties) return;

      if (tn === 2) difficulty = difficulties.simple;
      else if (tn === 3) difficulty = difficulties.routine;
      else if (tn === 4) difficulty = difficulties.average;
      else if (tn === 5) difficulty = difficulties.challenging;
      else if (tn === 6 || tn === 7) difficulty = difficulties.hard;
      else if (tn === 8) difficulty = difficulties.strenuous;
      else if (tn === 9) difficulty = difficulties.extreme;
      else if (tn >= 10) difficulty = difficulties.nearlyimpossible;
   });

   function Reset() {
      targetNumber = 5;
      modifiers = 0;
      diceBought = 0;
      karmaCost = 0;
      isDefaultingAsString = "false";
      selectEl?.focus();
   }

   function Submit() {
      console.log("Submit:", {
         targetNumber,
         modifiers,
         diceBought,
         karmaCost,
         isDefaulting,
      });
   }

   function handleSelectKeydown(e) {
      if (["ArrowUp", "w", "W"].includes(e.key)) {
         e.preventDefault();
         selectEl.selectedIndex = 0;
         isDefaultingAsString = selectEl.value;
      }
      if (["ArrowDown", "s", "S"].includes(e.key)) {
         e.preventDefault();
         selectEl.selectedIndex = 1;
         isDefaultingAsString = selectEl.value;
      }
      if (e.key === "Enter" || e.key === "Tab") {
         e.preventDefault();
         focusNext();
      }
   }

   function handleCounterKeydown(e) {
      if (e.key === "Enter" || e.key === "Tab") {
         e.preventDefault();
         focusNext();
      }
   }

   function handleRollButtonKeydown(e) {
      if (e.key === "Enter") {
         e.preventDefault();
         Submit();
      } else if (e.key === "Tab") {
         e.preventDefault();
         Reset();
         selectEl?.focus();
      }
   }

   function handleClearButtonKeydown(e) {
      if (e.key === "Enter") {
         e.preventDefault();
         Reset();
      } else if (e.key === "Tab") {
         e.preventDefault();
         selectEl?.focus();
      }
   }

   function focusNext() {
      const index = focusables.findIndex((el) => el === document.activeElement);
      if (index !== -1 && index < focusables.length - 1) {
         focusables[index + 1]?.focus();
      }
   }

   function trapFocus(e) {
      if (e.key !== "Tab" && e.key !== "Enter") return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (document.activeElement === last) {
         e.preventDefault();
         first?.focus();
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
   <div class="roll-composer-card">
      <h1 class="no-margin">Roll Type</h1>
      <select bind:this={selectEl} bind:value={isDefaultingAsString} onkeydown={handleSelectKeydown}>
         <option value="false">Regular roll</option>
         <option value="true">Defaulting</option>
      </select>
   </div>

   <div class="roll-composer-card">
      <h1 class="no-margin">Target Number</h1>
      <h4 class="no-margin">{difficulty}</h4>
      <Counter bind:value={targetNumber} min="2" onkeydown={handleCounterKeydown} />
   </div>

   <div class="roll-composer-card">
      <h1 class="no-margin">Modifiers</h1>
      <Counter bind:value={modifiers} min="0" onkeydown={handleCounterKeydown} />
   </div>

   <div class="roll-composer-card">
      <h1 class="no-margin">Karma</h1>
      <h4 class="no-margin">Cost {karmaCost}</h4>
      <Counter
         bind:value={diceBought}
         min="0"
         onIncrement={karmaCostCalculator}
         onDecrement={karmaCostCalculator}
         onkeydown={handleCounterKeydown}
      />
   </div>

   <button class="regular" type="submit" onclick={Submit} onkeydown={handleRollButtonKeydown}>
      Roll!
   </button>
   <button class="regular" type="reset" onclick={Reset} onkeydown={handleClearButtonKeydown}>
      Clear
   </button>
</div>