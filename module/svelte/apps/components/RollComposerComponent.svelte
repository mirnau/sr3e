<script>
   import SR3ERoll from "@documents/SR3ERoll.js";
   import { onDestroy, onMount } from "svelte";
   import Counter from "./basic/Counter.svelte";
   import ItemDataService from "@services/ItemDataService.js";
   import { StoreManager, stores } from "../../svelteHelpers/StoreManager.svelte";
   import { localize } from "@services/utilities.js";
   import OpposeRollService from "@services/OpposeRollService.js";
   import Respond from "@sveltecomponent/Respond.svelte";
   import Resistance from "@sveltecomponent/Resistance.svelte";
   import Challenge from "@sveltecomponent/Challenge.svelte";
   import ComposerRoll from "@sveltecomponent/ComposerRoll.svelte";
   import { get } from "svelte/store";
   import FirearmService from "@services/FirearmService.js";

   let { actor, config } = $props();

   let actorStoreManager = StoreManager.Subscribe(actor);
   onDestroy(() => {
      $shouldDisplaySheen = false;
      StoreManager.Unsubscribe(actor);
   });

   let karmaPoolStore = actorStoreManager.GetRWStore("karma.karmaPool.value");
   let karmaPoolSumStore = actorStoreManager.GetSumROStore("karma.karmaPool");
   let penaltyStore = actorStoreManager.GetRWStore("health.penalty");

   let currentDicePoolSelectionStore = actorStoreManager.GetShallowStore(actor.id, stores.dicepoolSelection);
   let displayCurrentDicePoolStore = null;

   let targetNumber = $state(4);
   let modifiersArray = $state([]);
   let modifiersTotal = $state(0);
   let modifiedTargetNumber = $state(0);
   let difficulty = $state("");

   let diceBought = $state(0);
   let karmaCost = $state(0);
   let maxAffordableDice = $state(0);

   let currentDicePoolName = $state("");
   let currentDicePoolAddition = $state(0);

   let isDefaultingAsString = $state("false");
   let isDefaulting = $derived(isDefaultingAsString === "true");

   let hasTarget = $state(false);
   let visible = $state(false);
   let hasChallenged = $state(false);
   let isResponding = $state(false);
   let isResistingDamage = $state(false);
   let canSubmit = $state(true);
   let title = $state("");

   let associatedDicePoolString = $state("");
   let associatedDicePoolStore;
   let callingSkill;
   let linkedAttributeString;
   let linkedAttributeStore;
   let readwrite;
   let selectEl;
   let containerEl;

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

   let difficulties = ItemDataService.getDifficultyGradings(config);
   let shouldDisplaySheen = actorStoreManager.GetShallowStore(actor.id, stores.shouldDisplaySheen, false);

   // ------------------- helpers -------------------

   function upsertOrRemoveRecoil() {
      // strip any old recoil row
      const without = modifiersArray.filter((m) => m.id !== "recoil");

      // only compute recoil in combat and for item rolls
      const inCombat = FirearmService.inCombat?.() === true;
      const isItem = caller?.type === "item";
      if (!inCombat || !isItem) {
         if (without.length !== modifiersArray.length) modifiersArray = without;
         return;
      }

      const recoil = FirearmService.recoilModifierForComposer({ actor, caller });
      if (recoil) modifiersArray = [...without, recoil];
      else if (without.length !== modifiersArray.length) modifiersArray = without;
   }

   function getAttrDiceFromSumStore(attrKey) {
      const store = actorStoreManager.GetSumROStore(`attributes.${attrKey}`);
      return Number(get(store)?.sum ?? 0);
   }

   function buildPenaltyMod() {
      return $penaltyStore > 0 ? { id: "penalty", name: localize(config.health.penalty), value: -$penaltyStore } : null;
   }

   function upsertMod(mod) {
      const idx = modifiersArray.findIndex((m) => (mod.id && m.id === mod.id) || (!mod.id && m.name === mod.name));
      if (idx === -1) modifiersArray = [...modifiersArray, mod];
      else {
         const copy = [...modifiersArray];
         copy[idx] = { ...copy[idx], ...mod };
         modifiersArray = copy;
      }
   }

   function ensureDefaultingModForAttribute() {
      const has = modifiersArray.some((m) => m.id === "auto-default-attr" || m.name === "Skill to attribute");
      if (!has) {
         upsertMod({ id: "auto-default-attr", name: "Skill to attribute", value: 4 });
      }
   }

   function swallowDirectional(event) {
      // Prevent arrow keys from scrolling or moving focus
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
         event.stopPropagation();
         event.preventDefault();
      }
   }

   function handleSelectKeydown(event) {
      // Optional: you may have had special behaviour for the select
      // For now, just swallow arrow keys so they don’t navigate the whole sheet
      swallowDirectional(event);
   }

   // ------------------- composer API -------------------

   export function setCallerData(callerData, options = {}) {
      resetToDefaults();
      Object.assign(caller, callerData);

      const dict = CONFIG?.sr3e?.attributes ?? {};
      if (caller.responseMode && caller.type !== "attribute") {
         caller.type = "attribute";
         if (!caller.key) caller.key = "reaction";
         if (!caller.name) caller.name = game.i18n.localize(`sr3e.attributes.${caller.key}`) || caller.key;
         caller.item = undefined;
      }
      if (caller.type === "item" && caller.key && Object.prototype.hasOwnProperty.call(dict, caller.key)) {
         caller.type = "attribute";
         caller.item = undefined;
      }

      if (options.visible !== undefined) visible = options.visible;
      isResponding = caller.responseMode || false;
      hasTarget = game.user.targets.size > 0;

      modifiersArray = [];
      const pen = buildPenaltyMod();
      if (pen) upsertMod(pen);

      if (Number.isFinite(Number(caller.defenseTNMod)) && Number(caller.defenseTNMod) !== 0) {
         upsertMod({
            id: "weapon-defense",
            name: caller.defenseTNLabel || "Weapon difficulty",
            value: Number(caller.defenseTNMod),
         });
      }

      if (caller.type === "item") {
         const itemId = caller.item?.id ?? caller.key;
         const item = actor?.items?.get(itemId) ?? game.items?.get(itemId) ?? null;
         if (!item) throw new Error(`sr3e: Item not found for id/key "${itemId}"`);
         title = item.name;
         const [skillId] = (item.system.linkedSkillId ?? item.system.linkedSkilliD ?? "").split("::");
         const skill = actor.items.get(skillId);
         prepareSkillBasedRoll(skill, item.name);
         if (linkedAttributeString) caller.linkedAttribute = linkedAttributeString;
         if ((caller.dice ?? 0) === 0 && linkedAttributeString) {
            caller.dice = getAttrDiceFromSumStore(linkedAttributeString);
            isDefaultingAsString = "true";
            queueMicrotask(() => {
               if (selectEl) selectEl.value = "true";
            });
            ensureDefaultingModForAttribute();
         }
         return;
      }

      if (caller.type === "skill") {
         const skill = actor.items.get(caller.skillId);
         if (!skill) throw new Error(`sr3e: Skill not found for id "${caller.skillId}"`);
         prepareSkillBasedRoll(skill, caller.key);
         if (linkedAttributeString) caller.linkedAttribute = linkedAttributeString;
         return;
      }

      if (caller.type === "specialization") {
         const skill = actor.items.get(caller.skillId);
         if (!skill) throw new Error(`sr3e: Skill not found for id "${caller.skillId}"`);
         prepareSkillBasedRoll(skill, caller.key);
         return;
      }

      if (caller.type === "attribute") {
         title = game.i18n.localize(`sr3e.attributes.${caller.key}`) || caller.key;
         if ((caller.dice ?? 0) === 0) caller.dice = getAttrDiceFromSumStore(caller.key);
         return;
      }
   }

   function resetToDefaults() {
      targetNumber = 4;
      modifiersArray = [];
      diceBought = 0;
      currentDicePoolAddition = 0;
      karmaCost = 0;
      isDefaultingAsString = "false";
      hasChallenged = false;
      title = "";
      associatedDicePoolString = "";
   }

   // ------------------- internal logic -------------------

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
         linkedAttributeStore = actorStoreManager.GetSumROStore(`attributes.${linkedAttributeString}`);
      }
      if (skillType === "language") {
         readwrite = skillData?.readwrite;
      }
   }

   async function CommitEffects() {
      if ((karmaCost ?? 0) <= 0 && (currentDicePoolAddition ?? 0) <= 0) return;
      await actor.commitRollComposerEffects({
         karmaCost,
         poolName: currentDicePoolName,
         poolCost: currentDicePoolAddition,
      });
   }

   // ------------------- effects -------------------

   $effect(() => {
      if (!visible) return;
      if (caller?.type !== "item") return;

      const recoil = FirearmService.getRecoilModifier({ actor, caller, preview: true });
      const withoutRecoil = modifiersArray.filter((m) => m.id !== "recoil");

      if (recoil) {
         const changed =
            withoutRecoil.length !== modifiersArray.length ||
            !withoutRecoil.some((m) => m.id === "recoil" && m.value === recoil.value);
         if (changed) modifiersArray = [...withoutRecoil, recoil];
      } else if (withoutRecoil.length !== modifiersArray.length) {
         modifiersArray = withoutRecoil;
      }
   });

   $effect(() => {
      $shouldDisplaySheen = !isDefaulting && visible;
   });

   $effect(() => {
      const pen = buildPenaltyMod();
      const withoutPenalty = modifiersArray.filter((m) => m.id !== "penalty");

      // Only update if changed
      if (withoutPenalty.length !== modifiersArray.length) {
         modifiersArray = withoutPenalty;
      }

      if (pen && !withoutPenalty.some((m) => m.id === pen.id)) {
         modifiersArray = [...withoutPenalty, pen];
      }
   });

   $effect(() => {
      modifiersTotal = modifiersArray.reduce((acc, m) => acc + Number(m.value ?? 0), 0);
      modifiedTargetNumber = targetNumber + modifiersTotal;
      canSubmit = modifiedTargetNumber > 1;
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

   // ------------------- UI handlers -------------------

   function KarmaCostCalculator() {
      karmaCost = 0.5 * diceBought * (diceBought + 1);
   }

   function Reset() {
      resetToDefaults();
      FirearmService.clearRecoilTracking();

      const pen = buildPenaltyMod();
      if (pen) upsertMod(pen);
   }

   function OnClose() {
      visible = false;
      resetToDefaults();
   }

   function handleKey(event) {
      if (event.key === "Escape") {
         OnClose();
         event.stopPropagation();
         event.preventDefault();
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

      {#if !isDefaulting && currentDicePoolName}
         <div class="roll-composer-card">
            <h1>{localize(config.dicepools[currentDicePoolName])}</h1>
            <h4>Dice Added: {currentDicePoolAddition}</h4>
            <Counter
               class="karma-counter"
               bind:value={currentDicePoolAddition}
               min={0}
               max={$displayCurrentDicePoolStore.sum}
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

      {#if isResistingDamage}
         <Resistance
            {actor}
            {caller}
            {modifiersArray}
            {targetNumber}
            {modifiedTargetNumber}
            {diceBought}
            {isDefaulting}
            {currentDicePoolAddition}
            {OnClose}
            {CommitEffects}
         />
      {:else if isResponding}
         <Respond
            {actor}
            {caller}
            {modifiersArray}
            {targetNumber}
            {modifiedTargetNumber}
            {diceBought}
            {currentDicePoolAddition}
            {isDefaulting}
            {OnClose}
            {CommitEffects}
         />
      {:else if hasTarget}
         <Challenge
            {actor}
            {caller}
            {modifiersArray}
            {targetNumber}
            {modifiedTargetNumber}
            {diceBought}
            {currentDicePoolAddition}
            {isDefaulting}
            {OnClose}
            {CommitEffects}
         />
      {:else}
         <ComposerRoll
            {actor}
            {caller}
            {modifiersArray}
            {targetNumber}
            {modifiedTargetNumber}
            {diceBought}
            {currentDicePoolAddition}
            {isDefaulting}
            {OnClose}
            {CommitEffects}
         />
      {/if}
   </div>
{/if}
