<script>
   import { onDestroy, onMount } from "svelte";
   import Counter from "./basic/Counter.svelte";
   import ItemDataService from "../../../services/ItemDataService.js";
   import { StoreManager } from "../../svelteHelpers/StoreManager.svelte";
   import { localize } from "../../../services/utilities.js";

   let { actor, config, caller, onclose } = $props();

   let actorStoreManager = StoreManager.Subscribe(actor);

   onDestroy(() => {
      StoreManager.Unsubscribe(actor);
   });

   let karmaPoolStore = actorStoreManager.GetStore("karma.karmaPool");
   let karmaPoolBacking = $karmaPoolStore;

   let targetNumber = $state(5);
   let modifiers = $state(0);
   let karmaCost = $state(0);
   let diceBought = $state(0);
   let difficulty = $state("");
   let canSubmit = $state(true);
   let isDefaultingAsString = $state("false");
   let isDefaulting = $state(false);
   let title = $state("");

   let containerEl;
   let selectEl;
   let rollBtn;
   let clearBtn;
   let focusables = [];

   let difficulties = ItemDataService.getDifficultieGradings(config);

   let result = {};

   onMount(() => {
      updateFocusables();
      selectEl?.focus();

      if (caller.type === "attribute") {
         console.log("An attribute roll");
         title = localize(config.attributes[caller.key]);
      } else if (caller.type === "activeSkill") {
      } else if (caller.type === "knowledgeSkill") {
      } else if (caller.type === "languageSkill") {
      }
   });

   function updateFocusables() {
      const selector = isDefaulting
         ? "select, .counter-component[tabindex='0']:not(.karma-counter), button[type]"
         : "select, .counter-component[tabindex='0'], button[type]";

      focusables = Array.from(containerEl.querySelectorAll(selector));
   }

   function karmaCostCalculator() {
      karmaCost = 0.5 * diceBought * (diceBought + 1);
   }

   $effect(() => {
      isDefaulting = isDefaultingAsString === "true";
      updateFocusables();
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

   $effect(() => {
      canSubmit = targetNumber + modifiers < 2;
   });

   function Submit() {
      $karmaPoolStore -= karmaCost;

      onclose({
         dice: caller.options.dice + diceBought,
         attributeName: caller.key,
         options: {
            targetNumber: targetNumber,
            modifiers: modifiers,
            explodes: !isDefaulting,
         },
      });
   }

   function getRoot(el) {
      while (el && !focusables.includes(el)) el = el.parentElement;
      return el;
   }

   function focusNext() {
      const idx = focusables.indexOf(getRoot(document.activeElement));
      if (idx !== -1) focusables[(idx + 1) % focusables.length]?.focus();
   }

   function handleKey(e) {
      if (e.key === "Enter") {
         e.preventDefault();
         e.stopPropagation();
         const root = getRoot(document.activeElement);
         if (root === rollBtn) {
            Submit();
            return;
         }
         if (root === clearBtn) {
            Reset();
            return;
         }
         focusNext();
      } else if (e.key === "Tab") {
         e.preventDefault();
         e.stopPropagation();
         const root = getRoot(document.activeElement);
         if (root === rollBtn) {
            Reset();
            return;
         }
         focusNext();
      }
   }

   function swallowDirectional(e) {
      if (
         e.key === "Shift" ||
         e.key === "ArrowUp" ||
         e.key === "ArrowDown" ||
         e.key === "ArrowLeft" ||
         e.key === "ArrowRight"
      ) {
         e.stopPropagation();
      }
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
   }
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->

<div
   class="roll-composer-container"
   bind:this={containerEl}
   role="group"
   tabindex="-1"
   onkeydowncapture={handleKey}
   onkeydown={swallowDirectional}
>
   <div class="roll-composer-card">
      <h1>{title}</h1>
   </div>
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
      <Counter bind:value={targetNumber} min="2" />
   </div>

   <div class="roll-composer-card">
      <h1 class="no-margin">Modifiers</h1>
      <Counter bind:value={modifiers} />
   </div>

   {#if !isDefaulting}
      <div class="roll-composer-card">
         <h1 class="no-margin">Karma</h1>
         <h4 class="no-margin">Cost {karmaCost}</h4>
         <Counter
            class="karma-counter"
            bind:value={diceBought}
            min="0"
            max={actor.system.karma.karmaPool}
            onIncrement={karmaCostCalculator}
            onDecrement={karmaCostCalculator}
         />
      </div>
   {/if}

   <button class="regular" type="submit" disabled={canSubmit} bind:this={rollBtn} onclick={Submit}> Roll! </button>
   <button class="regular" type="reset" bind:this={clearBtn} onclick={Reset}> Clear </button>
</div>
