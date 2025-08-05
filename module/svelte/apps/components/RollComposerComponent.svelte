<script>
   import SR3ERoll from "@documents/SR3ERoll.js";
   import { onDestroy, onMount } from "svelte";
   import Counter from "./basic/Counter.svelte";
   import ItemDataService from "@services/ItemDataService.js";
   import { StoreManager, stores } from "../../svelteHelpers/StoreManager.svelte";
   import { localize } from "@services/utilities.js";
   import OpposeRollService from "@services/OpposeRollService.js";

   let { actor, config, onclose, visible = false } = $props();

   let actorStoreManager = StoreManager.Subscribe(actor);
   onDestroy(() => {
      $shouldDisplaySheen = false;
      StoreManager.Unsubscribe(actor);
   });

   let karmaPoolStore = actorStoreManager.GetRWStore("karma.karmaPool.value");
   let karmaPoolSumStore = actorStoreManager.GetSumROStore("karma.karmaPool");
   let penalty = actorStoreManager.GetRWStore("health.penalty");
   let karmaPoolBacking = $karmaPoolStore;

   let currentDicePoolSelectionStore = actorStoreManager.GetShallowStore(actor.id, stores.dicepoolSelection);
   let currentDicePoolName = $state("");
   let currentDicePoolAddition = $state(0);
   let displayCurrentDicePoolStore = null;

   let targetNumber = $state(4);
   let modifiersArray = $state([]);
   let karmaCost = $state(0);
   let diceBought = $state(0);
   let modifiersTotal = $state(0);
   let difficulty = $state("");
   let canSubmit = $state(true);
   let isDefaultingAsString = $state("false");
   let isDefaulting = $state(false);
   let title = $state("");
   let associatedDicePoolString = $state("");
   let maxAffordableDice = $state(0);
   let hasTarget = $state(false);
   let hasChallenged = $state(false);
   let isResponding = $state(false);
   let modifiedTargetNumber = $state(0);

   // Initialize caller with default values
   let caller = $state({
      type: null,
      key: null,
      dice: 0,
      value: 0,
      skillId: "",
      specialization: "",
      name: "",
      responseMode: false,
      contestId: null,
   });

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

   let shouldDisplaySheen = actorStoreManager.GetShallowStore(actor.id, stores.shouldDisplaySheen, false);

   export function setCallerData(callerData, options = {}) {
      resetToDefaults();

      Object.assign(caller, callerData);

      if (options.visible !== undefined) {
         visible = options.visible;
      }

      isResponding = caller.responseMode || false;
   }

   function resetToDefaults() {
      targetNumber = 4;
      modifiersArray = [];
      diceBought = 0;
      currentDicePoolAddition = 0;
      karmaCost = 0;
      isDefaultingAsString = "false";
      isDefaulting = false;
      hasChallenged = false;
      title = "";
      associatedDicePoolString = "";
   }

   $effect(() => {
      if (!caller.type) return;

      console.log("caller type", caller.type);

      if (caller.type === "active" || caller.type === "attribute") {
         $shouldDisplaySheen = true;
      } else {
         $shouldDisplaySheen = false;
      }
   });

   $effect(() => {
      hasTarget = game.user.targets.size > 0;
   });

   $effect(() => {
      if (!caller.type) return;

      updateFocusables();
      selectEl?.focus();

      if ($penalty > 0) {
         modifiersArray = [{ name: localize(config.health.penalty), value: -$penalty }];
      }

      switch (caller.type) {
         case "attribute": {
            title = localize(config.attributes[caller.key]);
            break;
         }

         case "skill":
         case "specialization": {
            const skill = actor.items.get(caller.skillId);
            prepareSkillBasedRoll(skill, caller.key);
            break;
         }

         case "item": {
            // If the item has a linked skill, resolve it
            const [skillId] = item.system.linkedSkilliD?.split("::") ?? [];
            const skill = actor.items.get(skillId);
            prepareSkillBasedRoll(skill);
            break;
         }

         default:
            console.warn("Unhandled caller type in RollComposer:", caller.type);
            break;
      }
   });

   function prepareSkillBasedRoll(skill, titleOverride) {
      if (!skill) return;

      const skillType = skill.system.skillType;
      const skillData = skill.system[skillType + "Skill"];

      title = titleOverride ?? skill.name;

      linkedAttributeString = skillData?.linkedAttribute ?? "";

      if (skillType === "active") {
         associatedDicePoolString = skillData?.associatedDicePool ?? "";
         if (associatedDicePoolString) {
            associatedDicePoolStore = actorStoreManager.GetRWStore(`dicePools.${associatedDicePoolString}`);
         }
      }

      if (linkedAttributeString) {
         linkedAttributeStore = actorStoreManager.GetRWStore(`attributes.${linkedAttributeString}`);
      }

      if (skillType === "language") {
         readwrite = skillData?.readwrite;
      }
   }

   async function Challenge() {
      hasChallenged = true;
      console.warn("Challenge: Initiating opposed rolls.");

      const targets = [...game.user.targets].map((t) => t.actor).filter(Boolean);

      if (targets.length === 0) {
         console.warn("No targets selected for opposed roll");
         return;
      }

      const totalDice = caller.dice + diceBought + currentDicePoolAddition;

      const options = {
         attributeName: caller.key,
         skillName: caller.name,
         specializationName: caller.specialization,
         modifiers: modifiersArray,
         callerType: caller.type,
         targetNumber,
         opposed: true,
      };

      const baseRoll = SR3ERoll.create(
         SR3ERoll.buildFormula(totalDice, {
            targetNumber: modifiedTargetNumber,
            explodes: !isDefaulting,
         }),
         { actor },
         options
      );

      await baseRoll.evaluate(options);
      await baseRoll.waitForResolution();

      console.log("Challenge: All contests resolved.");

      await CommitEffects();

      Hooks.callAll("actorSystemRecalculated", actor);
   }

   async function Respond() {
      const totalDice = caller.dice + diceBought + currentDicePoolAddition;

      const roll = SR3ERoll.create(
         SR3ERoll.buildFormula(totalDice, {
            targetNumber: modifiedTargetNumber,
            explodes: !isDefaulting,
         }),
         { actor },
         {
            attributeName: caller.key,
            skillName: caller.name,
            specializationName: caller.specialization,
            modifiers: modifiersArray,
            callerType: caller.type,
            targetNumber,
            opposed: true,
         }
      );

      await roll.evaluate();
      OpposeRollService.deliverResponse(caller.contestId, roll.toJSON());

      await CommitEffects();
      onclose?.();

      Hooks.callAll("actorSystemRecalculated", actor);
   }

   function Abort() {
      const contest = OpposeRollService.getContestForTarget(actor);
      OpposeRollService.abortOpposedRoll(contest.id);
      onclose?.();
   }

   function updateFocusables() {
      if (!containerEl) return;
      const selector = isDefaulting
         ? "select, .counter-component[tabindex='0']:not(.karma-counter), button[type]"
         : "select, .counter-component[tabindex='0'], button[type]";
      focusables = Array.from(containerEl.querySelectorAll(selector));
   }

   function KarmaCostCalculator() {
      karmaCost = 0.5 * diceBought * (diceBought + 1);
   }

   $effect(() => {
      isDefaulting = isDefaultingAsString === "true";
      updateFocusables();
   });

   $effect(() => {
      const sum = Number($karmaPoolSumStore?.sum);
      if (sum > 0) {
         maxAffordableDice = Math.floor((-1 + Math.sqrt(1 + 8 * sum)) * 0.5);
      } else {
         maxAffordableDice = 0;
      }
   });

   $effect(() => {
      currentDicePoolName = $currentDicePoolSelectionStore;
      if (!currentDicePoolName) return;

      currentDicePoolAddition = 0;
      displayCurrentDicePoolStore = actorStoreManager.GetSumROStore(`dicePools.${currentDicePoolName}`);
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
      currentDicePoolAddition = 0;
      karmaCost = 0;
      isDefaultingAsString = "false";
      selectEl?.focus();
   }

   $effect(() => {
      modifiersTotal = modifiersArray.reduce((acc, val) => acc + val.value, 0);
   });

   $effect(() => {
      modifiedTargetNumber = targetNumber + modifiersTotal;
      canSubmit = modifiedTargetNumber > 1;
   });

   async function HandleRoll(e) {
      e?.preventDefault?.();
      console.warn("HandleRoll triggered");

      const totalDice = caller.dice + diceBought + currentDicePoolAddition;

      const roll = SR3ERoll.create(
         SR3ERoll.buildFormula(totalDice, {
            targetNumber: modifiedTargetNumber,
            explodes: !isDefaulting,
         }),
         { actor },
         {
            attributeName: caller.key,
            skillName: caller.name,
            specializationName: caller.specialization,
            modifiers: modifiersArray,
            callerType: caller.type,
            targetNumber,
            opposed: false,
         }
      );

      await roll.evaluate();
      await roll.waitForResolution();
      await CommitEffects();

      onclose?.({
         dice: totalDice,
         attributeName: caller.key,
         options: {
            targetNumber,
            modifiers: modifiersArray,
            explodes: !isDefaulting,
         },
      });

      Hooks.callAll("actorSystemRecalculated", actor);

      visible = false;
   }

   async function CommitEffects() {
      const isInCombat = game.combat !== null && game.combat !== undefined;

      if (karmaCost > 0) {
         const karmaEffect = {
            name: `Karma Drain (${karmaCost})`,
            label: `Used ${karmaCost} Karma Pool`,
            icon: "icons/magic/light/explosion-star-glow-blue.webp",
            changes: [
               {
                  key: "system.karma.karmaPool.mod",
                  mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                  value: `-${karmaCost}`,
                  priority: 1,
               },
            ],
            origin: actor.uuid,
            ...(isInCombat
               ? {
                    duration: {
                       unit: "rounds",
                       value: 1,
                       startRound: game.combat.round,
                       startTurn: game.combat.turn,
                    },
                 }
               : {}),
            flags: {
               sr3e: {
                  temporaryKarmaPoolDrain: true,
                  expiresOutsideCombat: !isInCombat,
               },
            },
         };

         await actor.createEmbeddedDocuments("ActiveEffect", [karmaEffect], { render: false });
      }

      if (currentDicePoolAddition > 0 && currentDicePoolName) {
         const effect = {
            name: `Dice Pool Drain (${currentDicePoolName})`,
            label: `Used ${currentDicePoolAddition} from ${currentDicePoolName}`,
            icon: "systems/sr3e/textures/ai/icons/dicepool.webp",
            changes: [
               {
                  key: `system.dicePools.${currentDicePoolName}.mod`,
                  mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                  value: `-${currentDicePoolAddition}`,
                  priority: 1,
               },
            ],
            origin: actor.uuid,
            transfer: false,
            ...(isInCombat
               ? {
                    duration: {
                       unit: "rounds",
                       value: 1,
                       startRound: game.combat.round,
                       startTurn: game.combat.turn,
                    },
                 }
               : {}),
            flags: {
               sr3e: {
                  temporaryDicePoolDrain: true,
                  expiresOutsideCombat: !isInCombat,
               },
            },
         };

         await actor.createEmbeddedDocuments("ActiveEffect", [effect], { render: false });

         actor.applyActiveEffects();
      }
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
            CommitEffects();
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
{#if visible}
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

      {#if !(caller?.type === "attribute" && isDefaulting) && currentDicePoolName}
         <div class="roll-composer-card">
            <h1>{localize(config.dicepools[currentDicePoolName])}</h1>
            <h4>Dice Added: {currentDicePoolAddition}</h4>
            <Counter
               class="karma-counter"
               bind:value={currentDicePoolAddition}
               min={0}
               max={$displayCurrentDicePoolStore.sum}
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
               min={0}
               max={maxAffordableDice}
               onIncrement={KarmaCostCalculator}
               onDecrement={KarmaCostCalculator}
            />
         </div>
      {/if}

      {#if isResponding}
         <button class="regular" type="button" disabled={!canSubmit || hasChallenged} onclick={Respond}>Respond!</button
         >
         <button class="regular" type="button" onclick={Abort}>Abort Challenge</button>
      {:else if hasTarget}
         <button class="regular" type="button" disabled={!canSubmit || hasChallenged} onclick={Challenge}
            >Challenge!</button
         >
      {:else}
         <button class="regular" type="button" disabled={!canSubmit} bind:this={rollBtn} onclick={HandleRoll}
            >Roll!</button
         >
      {/if}

      <button class="regular" type="reset" bind:this={clearBtn} disabled={hasChallenged} onclick={Reset}>
         Clear
      </button>
   </div>
{/if}
