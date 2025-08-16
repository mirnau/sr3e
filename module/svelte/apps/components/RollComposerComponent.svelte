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
   import AbstractProcedure from "@services/procedure/FSM/AbstractProcedure.js";
   import FirearmProcedure from "@services/procedure/FSM/FirearmProcedure.js";
   import { recoilState, clearAllRecoilForActor } from "@services/ComposerAttackController.js";

   let { actor, config } = $props();

   let actorStoreManager = StoreManager.Subscribe(actor);
   onDestroy(() => {
      $shouldDisplaySheen = false;
      StoreManager.Unsubscribe(actor);
      if (unhook) Hooks.off("updateCombat", unhook);
      if (targetHook) Hooks.off("targetToken", targetHook);
      clearStoreSubscriptions();
   });

   const storeSubscriptions = [];

   function addSub(store, fn) {
      if (!store?.subscribe) return;
      const unsub = store.subscribe(fn);
      storeSubscriptions.push(unsub);
   }

   function clearStoreSubscriptions() {
      while (storeSubscriptions.length) {
         try {
            storeSubscriptions.pop()();
         } catch {
            /* noop */
         }
      }
   }

   let karmaPoolSumStore = actorStoreManager.GetSumROStore("karma.karmaPool");

   let currentDicePoolSelectionStore = actorStoreManager.GetShallowStore(actor.id, stores.dicepoolSelection);
   let displayCurrentDicePoolStore = null;

   let targetNumber = $state(4);
   let modifiersArrayStore = null;
   let modifiersTotal = $state(0);
   let modifiedTargetNumber = $state(0);
   let difficulty = $state("");
   let procedureStore = writable(null);

   let diceBought = $state(0);
   let karmaCost = $state(0);
   let maxAffordableDice = $state(0);

   let currentDicePoolName = $state("");
   let currentDicePoolAddition = $state(0);

   let isDefaultingAsString = $state("false");
   let isDefaulting = $derived(isDefaultingAsString === "true");

   let hasTargets = $state(false);
   let visible = $state(false);
   let canSubmit = $state(true);
   let title = writable("Title Not Set");
   let rangePrimedForWeaponId = $state(null);
   let rangeSuppressedForWeaponId = $state(null);

   let selectEl;
   let containerEl;

   let isFirearm = $state(false);
   let weaponMode = $state("");
   let declaredRounds = $state(1);
   let ammoAvailable = $state(null);
   let phaseKey = $state("");

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

   let shouldDisplaySheen = actorStoreManager.GetShallowStore(actor.id, stores.shouldDisplaySheen, false);

   function ResetRecoil() {
      procedureStore?.resetRecoil?.();
      procedureStore?.syncRecoil?.({ declaredRounds, ammoAvailable });
   }

   function onRemoveModifier(index) {
      const mod = modifiersArrayStore[index];
      if (mod?.id === "range" && mod.weaponId) {
         rangeSuppressedForWeaponId = mod.weaponId;
      }
      if (mod?.id === "recoil" && mod.weaponId) {
      }
      procedureStore?.removeModByIndex?.(index);
   }

   function getAttrDiceFromSumStore(attrKey) {
      const store = actorStoreManager.GetSumROStore(`attributes.${attrKey}`);
      return Number(get(store)?.sum ?? 0);
   }

   function markModTouched(index) {
      procedureStore?.markModTouchedAt?.(index);
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

   export function setCallerData(currentProcedure) {
      DEBUG &&
         !(currentProcedure instanceof AbstractProcedure) &&
         LOG.error("Unfit data type passed in", [__FILE__, __LINE__, setCallerData.name]);

      // wipe old subs first
      clearStoreSubscriptions();

      // swap in the new procedure instance
      $procedureStore = currentProcedure;

      //Needs to be reacitive for both parts, getting the store itself, not its value!
      //can't be left readonly, has to be writable, thus getting the store, and not sub
      modifiersArrayStore = $procedureStore.modifiersArrayStore;

      isFirearm = currentProcedure instanceof FirearmProcedure;

      // hook stores via the helper
      addSub($procedureStore.targetNumberStore, (v) => (targetNumber = v));
      addSub($procedureStore.modifiersTotalStore, (v) => (modifiersTotal = v));
      addSub($procedureStore.finalTNStore, (v) => (modifiedTargetNumber = v));
      addSub($procedureStore.difficultyStore, (v) => (difficulty = v));
      addSub($procedureStore.hasTargetsStore, (v) => (hasTargets = v));
      addSub($procedureStore.titleStore, (v) => (title = v));

      visible = true;
   }

   async function CommitEffects() {
      if ((karmaCost ?? 0) <= 0 && (currentDicePoolAddition ?? 0) <= 0) return;
      await actor.commitRollComposerEffects({
         karmaCost,
         poolName: currentDicePoolName,
         poolCost: currentDicePoolAddition,
      });
   }

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
      phaseKey = FirearmService.getPhase().key;
   });

   $effect(() => {
      if (!visible) return;
      caller;
      hasTargets;
      declaredRounds;
      weaponMode;
      phaseKey;
      procedureStore?.syncRecoil?.({ declaredRounds, ammoAvailable });
   });

   $effect(() => {
      if (!visible) return;
      hasTargets;
      if (!hasTargets) return;
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
      if (hasTargets) return;
      const idx = modifiersArrayStore?.findIndex?.((m) => m.id === "range");
      if (idx >= 0) procedureStore?.removeModByIndex?.(idx);
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
      canSubmit = Number(modifiedTargetNumber) > 1;
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

{#if visible}
   <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
   <div
      class="roll-composer-container"
      bind:this={containerEl}
      aria-role="presentation"
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
         <h4>Final: {modifiedTargetNumber}</h4>
      </div>

      <div class="roll-composer-card">
         <h1>T.N. Modifiers</h1>
         <button
            aria-label="Add a modifier"
            class="regular"
            onclick={() => procedureStore?.upsertMod?.({ name: "Modifier", value: 0 })}
         >
            <i class="fa-solid fa-plus"></i>
         </button>

         <h4>Modifiers Total: {modifiersTotal}</h4>

         {#each modifiersArrayStore as modifier, i (i)}
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

      {#if hasTargets}
         <Challenge {procedureStore} {OnClose} {CommitEffects} />
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
         {#if modifiersArrayStore?.some?.((m) => m.id === "recoil" || m.name === "Recoil")}
            <div class="roll-composer-card">
               <button
                  class="regular"
                  onclick={() => {
                     const idx = modifiersArrayStore.findIndex((m) => m.id === "recoil" || m.name === "Recoil");
                     if (idx >= 0) procedureStore?.removeModByIndex?.(idx);
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
