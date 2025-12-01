<script lang="ts">
   import { onMount, onDestroy } from "svelte";
   import Counter from "./basic/Counter.svelte";
   import { StoreManager, stores } from "../../svelteHelpers/StoreManager.svelte";
   import { localize } from "@services/utilities.js";
   import { get, writable } from "svelte/store";
   import FirearmService from "@families/FirearmService.js";
   import AbstractProcedure from "@services/procedure/FSM/AbstractProcedure.js";
   import FirearmProcedure from "@services/procedure/FSM/FirearmProcedure.js";
   import AttributeProcedure from "@services/procedure/FSM/AttributeProcedure.js";
   import SkillProcedure from "@services/procedure/FSM/SkillProcedure.js";
   import { recoilState, clearAllRecoilForActor } from "@services/ComposerAttackController.js";

   let { actor, config = CONFIG.sr3e } = $props();

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
         } catch {}
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

   let primaryLabel = $state("Roll!");
   let primaryEnabled = $state(true);
   let kindOfRoll = $state("Roll");
   let itemName = $state("");
   let titleText = $state("Title Not Set");

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
   let rangePrimedForWeaponId = $state(null);
   let rangeSuppressedForWeaponId = $state(null);

   // svelte-ignore non_reactive_update
   let selectEl;
   // svelte-ignore non_reactive_update
   let containerEl;

   let weaponMode = $state("");
   let declaredRounds = $state(1);
   let ammoAvailable = $state(null);
   let phaseKey = $state("");

   let caller = $state({});

   let shouldDisplaySheen = actorStoreManager.GetShallowStore(actor.id, stores.shouldDisplaySheen, false);

   function ResetRecoil() {
      $procedureStore?.resetRecoil?.();
      $procedureStore?.syncRecoil?.({ declaredRounds, ammoAvailable });
   }

   function onRemoveModifier(index) {
      const arr = get($procedureStore.modifiersArrayStore) ?? [];
      const mod = arr[index];
      if (mod?.id === "range" && mod.weaponId) {
         rangeSuppressedForWeaponId = mod.weaponId;
      }
      $procedureStore?.removeModByIndex?.(index);
   }

   function markModTouched(index) {
      $procedureStore?.markModTouchedAt?.(index);
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

   function addModifier() {
      const id = foundry?.utils?.randomID?.(8) ?? Math.random().toString(36).slice(2);
      $procedureStore?.upsertMod?.({ id, name: "Modifier", value: 0 });
   }
   function updateMod(i, patch) {
      const store = $procedureStore?.modifiersArrayStore;
      if (!store) return;
      const arr = get(store) ?? [];
      if (i < 0 || i >= arr.length) return;
      const next = arr.slice();
      next[i] = { ...next[i], ...patch };
      store.set(next);
   }
   function syncMod(i) {
      const arr = get($procedureStore.modifiersArrayStore) ?? [];
      if (i < 0 || i >= arr.length) return;
      $procedureStore.upsertMod?.(arr[i]);
   }

   export function setCallerData(currentProcedure) {
      if (!(currentProcedure instanceof AbstractProcedure)) throw new Error("Unfit data type");

      const existing = $procedureStore;
      const inContest = !!existing?.contestId;
      const isBasisProc = currentProcedure instanceof AttributeProcedure || currentProcedure instanceof SkillProcedure;

      // CASE 1: We already have a responder in an active contest and user picked a basis proc => convert to basis
      if (existing && inContest && isBasisProc && typeof existing.setResponseBasis === "function") {
         let basis = null;
         if (currentProcedure instanceof AttributeProcedure) {
            const extra = currentProcedure.toJSONExtra?.() || {};
            basis = { type: "attribute", key: extra.attributeKey, dice: currentProcedure.dice };
         } else {
            const extra = currentProcedure.toJSONExtra?.() || {};
            basis = {
               type: "skill",
               id: extra.skillId ?? null,
               name: extra.skillName ?? "Skill",
               specialization: extra.specName ?? null,
               poolKey: extra.poolKey ?? null,
               dice: currentProcedure.dice,
            };
         }
         if (basis) {
            existing.setResponseBasis(basis);
            existing.args = existing.args || {};
            existing.args.basis = basis;
            if (Number.isFinite(Number(basis.dice))) existing.dice = Math.max(0, Math.floor(Number(basis.dice)));
            // Tag caller with this contest’s basis only
            caller = { ...basis, __contestId: existing.contestId };
         }
         return;
      }

      // CASE 2: New procedure (likely a new contest): reset caller to avoid sticky basis
      clearStoreSubscriptions();
      $procedureStore = currentProcedure;

      // If this is a fresh responder with a different contest id, nuke any previous caller basis.
      const cid = $procedureStore?.contestId ?? null;
      if (!cid || caller?.__contestId !== cid) {
         caller = {};
      }

      rangePrimedForWeaponId = null;
      rangeSuppressedForWeaponId = null;

      modifiersArrayStore = $procedureStore.modifiersArrayStore;

      addSub($procedureStore.targetNumberStore, (v) => (targetNumber = v));
      addSub($procedureStore.modifiersTotalStore, (v) => (modifiersTotal = v));
      addSub($procedureStore.finalTNStore, (v) => (modifiedTargetNumber = v));
      addSub($procedureStore.difficultyStore, (v) => (difficulty = v));
      addSub($procedureStore.hasTargetsStore, (v) => (hasTargets = v));
      addSub($procedureStore.titleStore, (v) => (titleText = v));
      addSub($procedureStore.weaponModeStore, (v) => (weaponMode = v));
      addSub($procedureStore.ammoAvailableStore, (v) => (ammoAvailable = v));

      $procedureStore.setDefaultTNForComposer();
      visible = true;
   }

   export function setResponderBasis(basis) {
      const proc = $procedureStore;
      if (!proc) return;
      proc.setResponderBasis?.(basis);
      proc.applyResponderBasisDice?.();
      if (basis && basis.type === "skill") {
         const skill = actor?.items?.get?.(basis.id);
         const type = skill?.system?.skillType;
         const sub = type ? skill.system?.[`${type}Skill`] ?? {} : {};
         const poolKey = sub?.associatedDicePool || "";
         currentDicePoolSelectionStore?.set?.(poolKey);
      } else if (basis && basis.type === "attribute") {
         currentDicePoolSelectionStore?.set?.("");
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

   let unhook = null;
   let targetHook = null;
   onMount(() => {
      const refreshPhase = () => {
         const { key } = FirearmService.getPhase();
         if (key !== phaseKey) {
            phaseKey = key;
            $procedureStore?.syncRecoil?.({ declaredRounds, ammoAvailable });
         }
      };
      unhook = (..._args) => refreshPhase();
      Hooks.on("updateCombat", unhook);
      phaseKey = FirearmService.getPhase().key;

      targetHook = (user, token, targeted) => {
         if (user?.id !== game.user.id) return;
         rangePrimedForWeaponId = null;
         rangeSuppressedForWeaponId = null;
         const weapon = $procedureStore?.item;
         if (!weapon) return;
         const attackerToken = actor?.getActiveTokens?.()[0] ?? null;
         const targetToken = Array.from(game.user.targets)[0] ?? null;
         if (attackerToken && targetToken && $procedureStore instanceof FirearmProcedure) {
            if (rangeSuppressedForWeaponId !== weapon.id) {
               $procedureStore?.primeRangeForWeapon?.(attackerToken, targetToken);
               rangePrimedForWeaponId = weapon.id;
            }
         }
         $procedureStore?.syncRecoil?.({ declaredRounds, ammoAvailable });
      };
      Hooks.on("targetToken", targetHook);
   });

   $effect(() => {
      if (!visible) return;

      const proc = $procedureStore;
      if (!proc) return;

      hasTargets;
      declaredRounds;
      weaponMode;
      phaseKey;

      // Only push a basis if the caller is tagged for THIS contest and has a type.
      if (caller && caller.__contestId === proc.contestId && typeof caller.type === "string" && caller.type.trim()) {
         if (typeof proc.setResponseBasis === "function") {
            proc.setResponseBasis(caller);
            proc.args = proc.args || {};
            proc.args.basis = caller;
            if (Number.isFinite(Number(caller.dice))) {
               proc.dice = Math.max(0, Math.floor(Number(caller.dice)));
            }
         }
      }

      proc?.syncRecoil?.({ declaredRounds, ammoAvailable });
   });

   $effect(() => {
      const proc = $procedureStore;
      if (!proc) return;
      try {
         kindOfRoll = proc.getKindOfRollLabel?.() ?? (proc.hasTargets ? "Challenge" : "Roll");
         itemName = proc.getItemLabel?.() ?? (proc.item?.name || "");
         primaryLabel = proc.getPrimaryActionLabel?.() ?? "Roll!";
         primaryEnabled = proc.isPrimaryActionEnabled?.() ?? true;
      } catch {
         kindOfRoll = "Roll";
         itemName = "";
         primaryLabel = "Roll!";
         primaryEnabled = true;
      }
   });

   $effect(() => {
      if (!visible) return;
      if (!hasTargets) {
         const arr = get($procedureStore.modifiersArrayStore) ?? [];
         const idx = arr.findIndex((m) => m.id === "range");
         if (idx >= 0) $procedureStore?.removeModByIndex?.(idx);
         return;
      }
      if (!($procedureStore instanceof FirearmProcedure)) return;

      const weapon = $procedureStore?.item;
      if (!weapon) return;
      if (rangePrimedForWeaponId || rangeSuppressedForWeaponId === weapon.id) return;

      const attackerToken = actor?.getActiveTokens?.()?.[0] ?? null;
      const targetToken = Array.from(game.user.targets)[0] ?? null;
      if (!attackerToken || !targetToken) return;

      $procedureStore?.primeRangeForWeapon?.(attackerToken, targetToken);
      rangePrimedForWeaponId = weapon.id;
   });

   $effect(() => {
      if (!visible) return;
      if (!($procedureStore instanceof FirearmProcedure)) return;
      $procedureStore?.precompute?.({ declaredRounds, ammoAvailable });
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
      $procedureStore?.setSelectedPoolKey?.(currentDicePoolName);
   });

   $effect(() => {
      const p = $procedureStore;
      if (p) p.poolDice = currentDicePoolAddition;
   });
   $effect(() => {
      const p = $procedureStore;
      if (p) p.karmaDice = diceBought;
   });

   $effect(() => {
      if (!visible) return;
      $procedureStore?.targetNumberStore?.set?.(targetNumber);
   });

   $effect(() => {
      const cap = weaponMode === "burst" ? 3 : weaponMode === "fullauto" ? 10 : 1;
      const mag = Number(ammoAvailable ?? cap);
      if (!Number.isFinite(declaredRounds)) declaredRounds = 1;
      if (declaredRounds < (weaponMode === "fullauto" ? 3 : 1)) {
         declaredRounds = weaponMode === "fullauto" ? 3 : 1;
      }
      const maxR = Math.max(1, Math.min(cap, mag));
      if (declaredRounds > maxR) declaredRounds = maxR;
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
   <!-- svelte-ignore a11y_unknown_aria_attribute -->
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
         <h1>{titleText}</h1>
         <h1>Roll Type</h1>
         <select bind:this={selectEl} bind:value={isDefaultingAsString} onkeydown={handleSelectKeydown}>
            <option value="false">Regular roll</option>
            <option value="true">Defaulting</option>
         </select>
      </div>

      <div class="roll-composer-card">
         <h1>Target Number</h1>
         <h4>{difficulty}</h4>
         <Counter
            bind:value={targetNumber}
            min="2"
            onincrement={() => $procedureStore?.targetNumberStore?.set?.(targetNumber)}
            ondecrement={() => $procedureStore?.targetNumberStore?.set?.(targetNumber)}
         />
         <h4>Final: {modifiedTargetNumber}</h4>
      </div>

      <div class="roll-composer-card">
         <h1>T.N. Modifiers</h1>
         <button aria-label="Add a modifier" class="regular" onclick={addModifier}>
            <i class="fa-solid fa-plus"></i>
         </button>

         <h4>Modifiers Total: {modifiersTotal}</h4>

         {#each $modifiersArrayStore as modifier, i (modifier.id ?? i)}
            <div class="roll-composer-card array">
               <input
                  class="mod-name"
                  type="text"
                  value={modifier.name}
                  oninput={(e) => updateMod(i, { name: e.currentTarget.value })}
               />
               <Counter
                  bind:value={modifier.value}
                  onincrement={() => {
                     markModTouched(i);
                     syncMod(i);
                  }}
                  ondecrement={() => {
                     markModTouched(i);
                     syncMod(i);
                  }}
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
               onincrement={KarmaCostCalculator}
               ondecrement={KarmaCostCalculator}
            />
         </div>
      {/if}

      <button
         class="regular"
         type="button"
         disabled={!primaryEnabled}
         onclick={async () => {
            const proc = $procedureStore;
            if (!proc) return;

            // Karma + Pool
            proc.karmaDice = Math.max(0, Number(diceBought) || 0);
            if (proc?.constructor?.name === "MeleeFullDefenseProcedure") {
               // Full Defense initial test ignores pool
               proc.poolDice = 0;
            } else {
               proc.poolDice = Math.max(0, Number(currentDicePoolAddition) || 0);
            }

            // Debug & roll via the procedure (keeps logic in the chain, not here)
            DEBUG && LOG.inspect("DEF submit ->", [__FILE__, __LINE__], {
               kind: proc?.constructor?.name,
               basis: proc?.args?.basis,
               dice: proc?.dice,
               pool: proc?.poolDice,
               karma: proc?.karmaDice,
            });

            await proc.execute({ OnClose, CommitEffects });
         }}
      >
         {primaryLabel}
      </button>

      {#if $procedureStore instanceof FirearmProcedure}
         {#if weaponMode === "burst" || weaponMode === "fullauto"}
            <div class="roll-composer-card">
               <h1>Rounds</h1>
               <h4>{weaponMode === "burst" ? "Burst Fire" : "Full-Auto"}</h4>
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
         {#if recoilState(actor?.id).shots > 0}
            <div class="roll-composer-card">
               <button
                  class="regular"
                  onclick={() => {
                     const store = $procedureStore?.modifiersArrayStore;
                     if (store) {
                        const arr = get(store) ?? [];
                        const idx = arr.findIndex((m) => m.id === "recoil" || m.name === "Recoil");
                        if (idx >= 0) $procedureStore?.removeModByIndex?.(idx);
                     }
                     clearAllRecoilForActor(actor?.id);
                     $procedureStore?.syncRecoil?.({ declaredRounds, ammoAvailable });
                  }}
               >
                  Clear Recoil
               </button>
            </div>
         {/if}
      {/if}
   </div>
{/if}
