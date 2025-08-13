<script>
   import { onMount, onDestroy } from "svelte";
   import Counter from "./basic/Counter.svelte";
   import ItemDataService from "@services/ItemDataService.js";
   import { StoreManager, stores } from "../../svelteHelpers/StoreManager.svelte";
   import { localize } from "@services/utilities.js";
   import Respond from "@sveltecomponent/Respond.svelte";
   import Resistance from "@sveltecomponent/Resistance.svelte";
   import Challenge from "@sveltecomponent/Challenge.svelte";
   import ComposerRoll from "@sveltecomponent/ComposerRoll.svelte";
   import { get } from "svelte/store";
   import FirearmService from "@families/FirearmService.js";
   import {
      classifyWeapon,
      computeRecoilRow,
      precomputeFirearm,
      recoilState,
      clearAllRecoilForActor,
   } from "@services/ComposerAttackController.js";

   let { actor, config } = $props();

   let actorStoreManager = StoreManager.Subscribe(actor);
   onDestroy(() => {
      $shouldDisplaySheen = false;
      StoreManager.Unsubscribe(actor);
      if (unhook) Hooks.off("updateCombat", unhook);
      if (targetHook) Hooks.off("targetToken", targetHook);
   });

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
   let rangePrimedForWeaponId = $state(null);
   let rangeSuppressedForWeaponId = $state(null);

   // same pattern for recoil if you want to stop it from overriding user edits
   let recoilPrimedForWeaponId = $state(null);

   let associatedDicePoolString = $state("");
   let associatedDicePoolStore;
   let linkedAttributeString;
   let linkedAttributeStore;
   let readwrite;
   let selectEl;
   let containerEl;

   // ---- firearm context (for recoil) ----
   let isFirearm = $state(false);
   let weaponMode = $state(""); // "manual" | "semiauto" | "burst" | "fullauto" | ...
   let declaredRounds = $state(1); // user-controlled for BF/FA
   let ammoAvailable = $state(null); // null = unknown/unlimited; else number
   let phaseKey = $state(""); // "round:pass" from FirearmService.getPhase()

   // We keep caller shape intact
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

   // --------------- helpers ----------------

   function ResetRecoil() {
      clearAllRecoilForActor(actor?.id);
      upsertOrRemoveRecoil();
   }

   function onRemoveModifier(index) {
      const mod = modifiersArray[index];
      if (mod?.id === "range" && mod.weaponId) {
         rangeSuppressedForWeaponId = mod.weaponId;
      }
      if (mod?.id === "recoil" && mod.weaponId) {
         // optional: add a recoilSuppressedForWeaponId if you want the same behavior
      }
      modifiersArray = modifiersArray.filter((_, j) => j !== index);
   }

   function primeRangeForWeapon(weapon) {
      if (!weapon) return;
      if (rangeSuppressedForWeaponId === weapon.id) return;

      const attackerToken = canvas.tokens?.controlled?.[0] || actor.getActiveTokens()?.[0] || null;
      const targetToken = [...game.user.targets][0]?.object || null;
      if (!attackerToken || !targetToken) return; // do NOT set primed here

      const rangeShiftLeft = 0;
      const rangeMod = FirearmService.rangeModifierForComposer({
         actor,
         caller,
         attackerToken,
         targetToken,
         rangeShiftLeft,
      });
      if (!rangeMod) return; // still no “primed”

      const idx = modifiersArray.findIndex((m) => m.id === "range");
      if (idx >= 0 && modifiersArray[idx]?.meta?.userTouched) return;

      const mod = { ...rangeMod, id: "range", weaponId: weapon.id, source: "auto" };
      if (idx === -1) {
         modifiersArray = [...modifiersArray, mod];
      } else {
         const copy = [...modifiersArray];
         copy[idx] = { ...copy[idx], ...mod };
         modifiersArray = copy;
      }
      // Mark primed only after a successful insert/update
      rangePrimedForWeaponId = weapon.id;
   }

   function getAttrDiceFromSumStore(attrKey) {
      const store = actorStoreManager.GetSumROStore(`attributes.${attrKey}`);
      return Number(get(store)?.sum ?? 0);
   }

   function buildPenaltyMod() {
      const p = Number($penaltyStore ?? 0);
      return p > 0 ? { id: "penalty", name: localize(config.health.penalty), value: -p } : null;
   }

   function markModTouched(index) {
      const copy = [...modifiersArray];
      const mod = copy[index];
      copy[index] = { ...mod, meta: { ...(mod.meta || {}), userTouched: true } };
      modifiersArray = copy;
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
      if (!has) upsertMod({ id: "auto-default-attr", name: "Skill to attribute", value: 4 });
   }

   function swallowDirectional(event) {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
         event.stopPropagation();
         event.preventDefault();
      }
   }

   function handleSelectKeydown(event) {
      swallowDirectional(event);
   }

   function getWeaponFromCaller() {
      if (caller?.type !== "item") return null;
      const itemId = caller.item?.id ?? caller.key;
      return actor?.items?.get(itemId) ?? game.items?.get(itemId) ?? null;
   }

   function initFirearmContextFromWeapon(weapon) {
      if (!weapon) {
         isFirearm = false;
         weaponMode = "";
         declaredRounds = 1;
         ammoAvailable = null;
         return;
      }
      const { isFirearm: f, mode, declaredRounds: d, ammoAvailable: a } = classifyWeapon(weapon);
      isFirearm = f;
      weaponMode = mode;
      declaredRounds = d;
      ammoAvailable = a;
   }

   function upsertOrRemoveRecoil() {
      const existingIndex = modifiersArray.findIndex((m) => m.id === "recoil");
      const isItem = caller?.type === "item";
      if (!isItem) {
         if (existingIndex >= 0) modifiersArray = modifiersArray.filter((m, i) => i !== existingIndex);
         return;
      }

      const weapon = getWeaponFromCaller();
      if (!weapon) {
         if (existingIndex >= 0) modifiersArray = modifiersArray.filter((m, i) => i !== existingIndex);
         return;
      }

      const { isFirearm: f } = classifyWeapon(weapon);
      if (!f) {
         if (existingIndex >= 0) modifiersArray = modifiersArray.filter((m, i) => i !== existingIndex);
         return;
      }

      const row = computeRecoilRow({ actor, weapon, declaredRounds, ammoAvailable });
      if (!row) {
         if (existingIndex >= 0) modifiersArray = modifiersArray.filter((m, i) => i !== existingIndex);
         return;
      }

      // If user touched recoil, keep their value; otherwise keep it updated
      if (existingIndex === -1) {
         modifiersArray = [...modifiersArray, { ...row, id: "recoil", weaponId: weapon.id, source: "auto" }];
         return;
      }

      const existing = modifiersArray[existingIndex];
      if (existing?.meta?.userTouched) return;

      const copy = [...modifiersArray];
      copy[existingIndex] = { ...existing, ...row, id: "recoil", weaponId: weapon.id, source: "auto" };
      modifiersArray = copy;
   }

   // ------------------- composer API -------------------

   export function setCallerData(callerData, options = {}) {
      resetToDefaults();
      Object.assign(caller, callerData);
      caller.prep = callerData?.prep;
      caller.weaponId = callerData?.weaponId;

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
      isResistingDamage = callerData?.isResistingDamage || false;
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

         // init firearm context BEFORE we decide defaulting
         initFirearmContextFromWeapon(item);

         if (item.id !== rangePrimedForWeaponId) {
            rangeSuppressedForWeaponId = null; // new weapon, clear suppression
            primeRangeForWeapon(item);
         }
         const [skillId] = (item.system.linkedSkillId ?? item.system.linkedSkillId ?? "").split("::");
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
         initFirearmContextFromWeapon(null);
         prepareSkillBasedRoll(skill, caller.key);
         if (linkedAttributeString) caller.linkedAttribute = linkedAttributeString;
         return;
      }

      if (caller.type === "specialization") {
         const skill = actor.items.get(caller.skillId);
         if (!skill) throw new Error(`sr3e: Skill not found for id "${caller.skillId}"`);
         initFirearmContextFromWeapon(null);
         prepareSkillBasedRoll(skill, caller.key);
         return;
      }

      if (caller.type === "attribute") {
         initFirearmContextFromWeapon(null);
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
      // firearm context
      isFirearm = false;
      weaponMode = "";
      declaredRounds = 1;
      ammoAvailable = null;
      // range priming should be once per roll, so reset here
      rangePrimedForWeaponId = null;
      rangeSuppressedForWeaponId = null;
      // optional parity with recoil if you later implement similar suppression
      recoilPrimedForWeaponId = null;
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

   // ------------------- lifecycle / hooks -------------------
   let unhook = null;
   let targetHook = null;
   onMount(() => {
      const refreshPhase = () => {
         const { key } = FirearmService.getPhase();
         if (key !== phaseKey) {
            phaseKey = key;
            // recoil may reset across passes -> recompute
            upsertOrRemoveRecoil();
         }
      };
      unhook = (..._args) => refreshPhase();
      Hooks.on("updateCombat", unhook);
      // initialize once
      phaseKey = FirearmService.getPhase().key;

      // react to target acquisition/clear
      targetHook = () => {
         hasTarget = game.user.targets.size > 0;
      };
      Hooks.on("targetToken", targetHook);
   });

   // ------------------- reactivity -------------------

   // keep recoil in sync with visibility / caller / target / declaredRounds
   $effect(() => {
      if (!visible) return;
      caller;
      hasTarget;
      declaredRounds;
      weaponMode;
      phaseKey;
      upsertOrRemoveRecoil();
   });

   $effect(() => {
      if (!visible) return;
      caller; // re-run when the roll source changes
      hasTarget; // re-run when a target is acquired/cleared
      if (caller?.type !== "item") return;
      const weapon = getWeaponFromCaller();
      if (!weapon) return;
      if (rangeSuppressedForWeaponId === weapon.id) return; // user removed it
      if (rangePrimedForWeaponId === weapon.id) return; // already did it this roll
      primeRangeForWeapon(weapon); // this will set rangePrimedForWeaponId on success
   });

   $effect(() => {
      if (!visible) return;
      if (caller?.type !== "item") return;
      const weapon = getWeaponFromCaller();
      if (!weapon) return;

      const { isFirearm: f } = classifyWeapon(weapon);
      if (!f) {
         caller.firearmPlan = null;
         caller.damagePacket = null;
         return;
      }

      const pre = precomputeFirearm({ actor, weapon, declaredRounds, ammoAvailable });
      caller.firearmPlan = pre.plan;
      caller.damagePacket = pre.damage;
   });

   $effect(() => {
      $shouldDisplaySheen = !isDefaulting && visible;
   });

   $effect(() => {
      const pen = buildPenaltyMod();
      const withoutPenalty = modifiersArray.filter((m) => m.id !== "penalty");
      if (withoutPenalty.length !== modifiersArray.length) modifiersArray = withoutPenalty;
      if (pen && !withoutPenalty.some((m) => m.id === pen.id)) {
         modifiersArray = [...withoutPenalty, pen];
      }
   });

   $effect(() => {
      modifiersTotal = modifiersArray.reduce((acc, m) => acc + Number(m.value ?? 0), 0);
      modifiedTargetNumber = Math.max(2, targetNumber + modifiersTotal); // SR3 min TN = 2
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
      maxAffordableDice = sum > 0 ? Math.floor((-1 + Math.sqrt(1 + 8 * sum)) * 0.5) : 0;
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
               <Counter
                  bind:value={modifier.value}
                  onIncrement={() => markModTouched(i)}
                  onDecrement={() => markModTouched(i)}
               />
               <button class="regular" aria-label="Remove a modifier" onclick={() => onRemoveModifier(i)}>
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
      {#if caller.type === "item" && isFirearm && (weaponMode === "burst" || weaponMode === "fullauto")}
         <div class="roll-composer-card">
            <h1>Rounds</h1>
            <h4>{weaponMode === "burst" ? "Burst Fire" : "Full‑Auto"}</h4>
            <Counter
               bind:value={declaredRounds}
               min={weaponMode === "fullauto" ? 3 : 1}
               max={(() => {
                  if (weaponMode === "burst") return Math.min(3, ammoAvailable ?? 3);
                  // fullauto
                  const cap = 10;
                  return Math.min(cap, ammoAvailable ?? cap);
               })()}
            />
         </div>
      {/if}
      {#if (() => {
         const { shots } = recoilState(actor?.id);
         return shots > 0;
      })()}
         {#if modifiersArray.some((m) => m.id === "recoil" || m.name === "Recoil")}
            <div class="roll-composer-card">
               <button
                  class="regular"
                  onclick={() => {
                     modifiersArray = modifiersArray.filter((m) => m.id !== "recoil" && m.name !== "Recoil");
                     clearAllRecoilForActor(actor?.id);
                  }}
               >
                  Clear Recoil
               </button>
            </div>
         {/if}
      {/if}
   </div>
{/if}
