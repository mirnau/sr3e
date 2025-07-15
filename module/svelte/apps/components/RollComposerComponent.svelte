<script>
   import { onDestroy, onMount } from "svelte";
   import Counter from "./basic/Counter.svelte";
   import ItemDataService from "../../../services/ItemDataService.js";
   import { StoreManager, stores } from "../../svelteHelpers/StoreManager.svelte";
   import { localize } from "../../../services/utilities.js";

   let { actor, config, caller, onclose } = $props();

   let actorStoreManager = StoreManager.Subscribe(actor);
   onDestroy(() => StoreManager.Unsubscribe(actor));

   let karmaPoolStore = actorStoreManager.GetRWStore("karma.karmaPool");
   let penalty = actorStoreManager.GetRWStore("health.penalty");
   let karmaPoolBacking = $karmaPoolStore;

   let currentDicePoolSelectionStore = actorStoreManager.GetShallowStore(actor.id, stores.dicepoolSelection);
   let currentDicePoolName = $state("");
   let currentDicePoolStore;

   let targetNumber = $state(5);
   let modifiersArray = $state([]);
   let karmaCost = $state(0);
   let diceBought = $state(0);
   let poolDiceBought = $state(0);
   let modifiersTotal = $state(0);
   let difficulty = $state("");
   let canSubmit = $state(true);
   let isDefaultingAsString = $state("false");
   let isDefaulting = $state(false);
   let title = $state("");
   let associatedDicePoolString = $state("");

   let associatedDicePoolStore;
   let containerEl;
   let selectEl;
   let rollBtn;
   let clearBtn;
   let callingSkill;
   let linkedAttributeString;
   let linkedAttributeStore;
   let readwrite;
   let focusables = [];

   let difficulties = ItemDataService.getDifficultyGradings(config);

   onMount(() => {
      updateFocusables();
      selectEl?.focus();

      if ($penalty > 0) {
         modifiersArray = [{ name: localize(config.health.penalty), value: -$penalty }];
      }

      if (caller.type === "attribute") {
         title = localize(config.attributes[caller.key]);
      }

      if (caller.skillId) {
         let skill = actor.items.get(caller.skillId);
         title = caller.key;

         console.log("Resolved skill:", skill); // OK

         if (skill.system.skillType === "active") {
            linkedAttributeString = skill.system.activeSkill.linkedAttribute;

            console.log("linkedAttributeString", linkedAttributeString); //OK

            associatedDicePoolString = skill.system.activeSkill.associatedDicePool;
            associatedDicePoolStore = actorStoreManager.GetRWStore(`dicePools.${associatedDicePoolString}`);

            console.log("associatedDicePoolStore", $associatedDicePoolStore); // OK
         } else if (skill.system.skillType === "knowledge") {
            linkedAttributeString = skill.system.knowledgeSkill.linkedAttribute;
         } else if (skill.system.skillType === "language") {
            linkedAttributeString = skill.system.languageSkill.linkedAttribute;
            readwrite = skill.system.languageSkill.readwrite;
         }

         if (linkedAttributeString !== "") {
            linkedAttributeStore = actorStoreManager.GetRWStore(`attributes.${linkedAttributeString}`);

            console.log("linkedAttributeStore", $linkedAttributeStore); // OK
         }
      }
   });

   function updateFocusables() {
      const selector = isDefaulting
         ? "select, .counter-component[tabindex='0']:not(.karma-counter), button[type]"
         : "select, .counter-component[tabindex='0'], button[type]";
      focusables = Array.from(containerEl.querySelectorAll(selector));
   }

   function KarmaCostCalculator() {
      karmaCost = 0.5 * diceBought * (diceBought + 1);
   }

   function AddDiceFromPool() {
      if ($currentDicePoolStore > 0) {
         poolDiceBought += 1;
         $currentDicePoolStore -= 1;
      }
   }

   function RemoveDiceFromPool() {}

   $effect(() => {
      isDefaulting = isDefaultingAsString === "true";
      updateFocusables();
   });

   $effect(() => {
      currentDicePoolName = $currentDicePoolSelectionStore;
      if (!currentDicePoolName) return;

      currentDicePoolStore = actorStoreManager.GetRWStore(`dicePools.${currentDicePoolName}`);
   });

   $effect(() => {
      const baseModifiers = $penalty > 0 ? [{ name: localize(config.health.penalty), value: -$penalty }] : [];

      if (isDefaulting) {
         switch (caller.type) {
            case "attribute":
               modifiersArray = [...baseModifiers, { name: "Skill to attribute", value: 4 }];
               break;
            case "activeSkill":
            case "knowledgeSkill":
            case "languageSkill":
               modifiersArray = [...baseModifiers, { name: "Skill to skill", value: 2 }];
               break;
            case "specialization":
               modifiersArray = [...baseModifiers, { name: "Specialization to skill", value: 3 }];
               break;
            default:
               console.warn(`Unknown caller type for defaulting: ${caller.type}`);
               canSubmit = false;
               break;
         }
      } else {
         modifiersArray = baseModifiers;
      }
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
      modifiersArray = $penalty > 0 ? [{ name: localize(config.health.penalty), value: -$penalty }] : [];
      diceBought = 0;
      karmaCost = 0;
      isDefaultingAsString = "false";
      selectEl?.focus();
   }

   $effect(() => {
      modifiersTotal = modifiersArray.reduce((acc, val) => acc + val.value, 0);
   });

   $effect(() => {
      canSubmit = targetNumber + modifiersTotal < 2;
   });

   function Submit() {
      $karmaPoolStore -= karmaCost;

      onclose({
         dice: caller.dice + diceBought,
         attributeName: caller.key,
         options: {
            targetNumber: targetNumber,
            modifiers: modifiersArray,
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
      <h1>Roll Type</h1>
      <select bind:this={selectEl} bind:value={isDefaultingAsString} onkeydown={handleSelectKeydown}>
         <option value="false">Regular roll</option>
         <option value="true">Defaulting</option>
      </select>
   </div>

   <div class="roll-composer-card">
      <h1>Target Number</h1>
      <h4>{difficulty}</h4>
      <Counter bind:value={targetNumber} min="2" />
   </div>

   <div class="roll-composer-card">
      <h1>T.N. Modifiers</h1>
      <button
         aria-label="Add a modifier"
         class="regular"
         onclick={() => {
            modifiersArray = [...modifiersArray, { name: "Modifier", value: 0 }];
         }}
      >
         <i class="fa-solid fa-plus"></i>
      </button>

      <h4>Modifiers Total: {modifiersTotal}</h4>

      {#each modifiersArray as modifier, i (i)}
         <div class="roll-composer-card array">
            <h4 contenteditable="true">{modifier.name}</h4>
            <Counter bind:value={modifier.value} />
            <button
               class="regular"
               aria-label="Remove a modifier"
               onclick={() => {
                  modifiersArray = modifiersArray.filter((_, j) => j !== i);
               }}
            >
               <i class="fa-solid fa-minus"></i>
            </button>
         </div>
      {/each}
   </div>

   {#if !(caller.type === "attribute" && isDefaulting) && currentDicePoolName && currentDicePoolStore}
      <div class="roll-composer-card">
         <h1>{localize(config.dicepools[currentDicePoolName])}</h1>
         <h4>Dice Added: {poolDiceBought}</h4>
         <Counter
            class="karma-counter"
            bind:value={poolDiceBought}
            min="0"
            max={$currentDicePoolStore}
            onIncrement={AddDiceFromPool}
            onDecrement={RemoveDiceFromPool}
         />
      </div>
   {/if}

   {#if !isDefaulting}
      <div class="roll-composer-card">
         <h1>Karma</h1>
         <h4>Extra Dice Cost: {karmaCost}</h4>
         <Counter
            class="karma-counter"
            bind:value={diceBought}
            min="0"
            max={actor.system.karma.karmaPool}
            onIncrement={KarmaCostCalculator}
            onDecrement={KarmaCostCalculator}
         />
      </div>
   {/if}

   <button class="regular" type="submit" disabled={canSubmit} bind:this={rollBtn} onclick={Submit}> Roll! </button>
   <button class="regular" type="reset" bind:this={clearBtn} onclick={Reset}> Clear </button>
</div>
