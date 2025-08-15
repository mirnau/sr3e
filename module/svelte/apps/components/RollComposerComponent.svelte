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
   import { get, writable } from "svelte/store";
   import FirearmService from "@families/FirearmService.js";
   import AbstractProcedure from "@services/procedure/AbstractProcedure.js";
   import FirearmProcedure from "@services/procedure/FSM/FirearmProcedure.js";

   let { actor, config } = $props();

   let actorStoreManager = StoreManager.Subscribe(actor);
   onDestroy(() => {
      $shouldDisplaySheen = false;
      StoreManager.Unsubscribe(actor);
      if (unhook) Hooks.off("updateCombat", unhook);
      if (targetHook) Hooks.off("targetToken", targetHook);
      if (unsubTN) unsubTN();
      if (unsubMods) unsubMods();
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
   let procedureStore;

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
   let titleStore = writable("Title Not Set");
   let rangePrimedForWeaponId = $state(null);
   let rangeSuppressedForWeaponId = $state(null);

   // same pattern for recoil if you want to stop it from overriding user edits
   let associatedDicePoolString = $state("");
   let associatedDicePoolStore;
   let linkedAttributeString;
   let linkedAttributeStore;
   let readwrite;
   let selectEl;
   let containerEl;
   let unsubTN;
   let unsubMods;

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
      procedureStore?.resetRecoil?.();
      procedureStore?.syncRecoil?.({ declaredRounds, ammoAvailable });
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

   function swallowDirectional(event) {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
         event.stopPropagation();
         event.preventDefault();
      }
   }

   function handleSelectKeydown(event) {
      swallowDirectional(event);
   }

   // ------------------- composer API -------------------

   // Ensure OpposeRollService is imported where this lives:
   // import OpposeRollService from "@services/OpposeRollService.js";

   export function setCallerData(currentProcedure) {
      DEBUG &&
         !(currentProcedure instanceof AbstractProcedure) &&
         LOG.error("Unfit data type passed in", [__FILE__, __LINE__, setCallerData.name]);
      if (unsubTN) unsubTN();
      if (unsubMods) unsubMods();

      procedureStore = currentProcedure;
      isFirearm = currentProcedure instanceof FirearmProcedure;

      unsubTN = procedureStore.targetNumber.subscribe((v) => (targetNumber = v));
      unsubMods = procedureStore.tnModifiers.subscribe((v) => (modifiersArray = v));

      const penalty = buildPenaltyMod();
      if (penalty) procedureStore.upsertMod(penalty);

      titleStore = procedureStore.title; //Replacing the store, not its content.
      visible = true;
   }

   // ------------------- internal logic -------------------

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
            procedureStore?.syncRecoil?.({ declaredRounds, ammoAvailable });
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
      procedureStore?.syncRecoil?.({ declaredRounds, ammoAvailable });
   });

   $effect(() => {
      if (!visible) return;
      hasTarget;
      if (!hasTarget) return;
      if (!isFirearm) return;

      const weapon = procedureStore?.item;
      if (!weapon) return;
      if (rangePrimedForWeaponId || rangeSuppressedForWeaponId === weapon.id) return;

      const attackerToken = actor?.getActiveTokens?.()[0] ?? null;
      const targetToken = Array.from(game.user.targets)[0] ?? null;
      procedureStore?.primeRangeForWeapon?.(attackerToken, targetToken);
      rangePrimedForWeaponId = weapon.id;
   });

   $effect(() => {
      if (!visible) return;
      hasTarget;
      if (hasTarget) return;

      // remove range row when no target
      const idx = modifiersArray.findIndex((m) => m.id === "range");
      if (idx >= 0) {
         modifiersArray = modifiersArray.filter((m, i) => i !== idx);
         // do NOT set suppression here; user didn’t remove it manually
      }
   });

   $effect(() => {
      if (!visible) return;
      if (!isFirearm) return;
      procedureStore?.precompute?.({ declaredRounds, ammoAvailable });
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
         <h1>{$titleStore}</h1>
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

      {#if false}
         <!--Resistance {procedureStore} {OnClose} {CommitEffects} /-->
      {:else if false}
         <!--Respond {procedureStore} {OnClose} {CommitEffects} /-->
      {:else if $procedureStore.hasTargets}
         <Challenge {procedureStore} {OnClose} {CommitEffects}>
      {:else}
         <!--ComposerRoll {procedureStore} {OnClose} {CommitEffects} /-->
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
