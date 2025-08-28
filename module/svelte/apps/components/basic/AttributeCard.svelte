<script>
  import { localize } from "@services/utilities.js";
  import { flags } from "@services/commonConsts.js";
  import { StoreManager } from "@sveltehelpers/StoreManager.svelte";
  import { onDestroy } from "svelte";
  import { unmount } from "svelte";
  import { writable } from "svelte/store";
  import ProcedureFactory from "@services/procedure/FSM/ProcedureFactory.js";

  import AttributeCreationShopping from "@services/shopping/AttributeCreationShopping.js";
  import AttributeKarmaShopping from "@services/shopping/AttributeKarmaShopping.js";

  const TRACE = false;

  let { actor, localization, key } = $props();

  // Local StoreManager (your pattern)
  let storeManager = StoreManager.Subscribe(actor);
  onDestroy(() => {
    StoreManager.Unsubscribe(actor);
  });

  // Mode flags
  let isShoppingState = storeManager.GetFlagStore(flags.actor.isShoppingState);
  let isCharacterCreationStore = storeManager.GetFlagStore(flags.actor.isCharacterCreation);

  // Actor attribute stores
  // Sum RO store that yields { value, mod, sum }
  let valueROStore = storeManager.GetSumROStore(`attributes.${key}`);

  // RML from metatype (never for magic)
  let metatype = $derived(actor.items.find((i) => i.type === "metatype") || null);
  let rml = $derived(
    key === "magic" || !metatype ? null : (metatype.system.attributeLimits?.[key] ?? null)
  );
  // Karma purchases can exceed the racial limit up to 1.5× RML
  let karmaMax = $derived(rml == null ? null : Math.floor(rml * 1.5));

  // Resources
  let creationPointsStore = storeManager.GetRWStore("creation.attributePoints");
  let goodKarmaStore = storeManager.GetRWStore("karma.goodKarma");

  // Strategy instance
  let strategy = null;

  // --- A STABLE UI store that the template always reads from ---
  // We pipe the appropriate source into this store on mode changes.
  const uiDisplay = writable({ value: 0, mod: 0, sum: 0 });

  // Keep active subscription cleanup
  let _unsubDisplay = null;

  function _pipeDisplay(fromStore) {
    // Clean old subscription
    _unsubDisplay && _unsubDisplay();
    _unsubDisplay = null;

    if (!fromStore || typeof fromStore.subscribe !== "function") {
      // Fallback to zeros to avoid runtime errors
      uiDisplay.set({ value: 0, mod: 0, sum: 0 });
      return;
    }
    // Pipe source store into the stable uiDisplay store
    _unsubDisplay = fromStore.subscribe((v) => {
      // Some Get* stores in this codebase return plain numbers or objects.
      // Normalize to { value, mod, sum } for the template.
      if (v && typeof v === "object" && "sum" in v) {
        uiDisplay.set({ value: v.value ?? 0, mod: v.mod ?? 0, sum: v.sum ?? 0 });
      } else if (typeof v === "number") {
        uiDisplay.set({ value: v, mod: 0, sum: v });
      } else {
        uiDisplay.set({ value: 0, mod: 0, sum: 0 });
      }
    });
  }

  onDestroy(() => {
    _unsubDisplay && _unsubDisplay();
    _unsubDisplay = null;
  });

  // Strategy wiring + display source routing
  $effect(() => {
    if (strategy && typeof strategy.dispose === "function") strategy.dispose();
    strategy = null;

    if (!$isShoppingState) {
      TRACE && console.log(`[Card] not shopping — show live actor sum`);
      _pipeDisplay(valueROStore);
      return;
    }

    const disallowKarmaRaise = key === "reaction" || key === "magic" || key === "essence";
    const disallowCreationRaise = key === "reaction";

    if ($isCharacterCreationStore) {
      strategy = new AttributeCreationShopping({
        actor,
        key,
        storeManager,
        rml: rml ?? null,
        max: rml ?? null,
        disallowRaise: disallowCreationRaise
      });
      TRACE && console.log(`[Card] creation strategy for ${key} (RML=${rml ?? "n/a"})`);
      _pipeDisplay(valueROStore); // creation changes actor immediately
    } else {
      strategy = new AttributeKarmaShopping({
        actor,
        key,
        storeManager,
        rml: rml ?? null,
        max: karmaMax ?? null,
        disallowRaise: disallowKarmaRaise,
        isShoppingStateStore: isShoppingState
      });
      TRACE && console.log(`[Card] karma strategy for ${key} (RML=${rml ?? "n/a"})`);
      _pipeDisplay(strategy.displayRO); // stagedBase + mod
    }
  });

  // Chevron guards — booleans computed from stable, always-existing stores
  let canIncrement = $derived(() => {
    if (!$isShoppingState) return false;
    if (!strategy) return false;

    if ($isCharacterCreationStore) {
      const _sum = $valueROStore.sum;
      const _pts = $creationPointsStore;
      const ok = strategy.computeCanIncrement();
      TRACE && console.log(`[Card:canUp][creation] ${ok}`);
      return ok;
    } else {
      const _stagedSum = $uiDisplay.sum; // reacts when stagedBase changes
      const _good = $goodKarmaStore;     // reacts when good karma changes
      const ok = strategy.computeCanIncrement();
      TRACE && console.log(`[Card:canUp][karma] ${ok}`);
      return ok;
    }
  });

  let canDecrement = $derived(() => {
    if (!$isShoppingState) return false;
    if (!strategy) return false;

    if ($isCharacterCreationStore) {
      const _sum = $valueROStore.sum;
      const ok = strategy.computeCanDecrement();
      TRACE && console.log(`[Card:canDown][creation] ${ok}`);
      return ok;
    } else {
      const _stagedSum = $uiDisplay.sum; // reacts when stagedBase changes
      const ok = strategy.computeCanDecrement();
      TRACE && console.log(`[Card:canDown][karma] ${ok}`);
      return ok;
    }
  });

  function increment() {
    TRACE && console.log(`[Card:click up] ${key}`);
    if (!strategy) return;
    strategy.applyIncrement();
  }

  function decrement() {
    TRACE && console.log(`[Card:click down] ${key}`);
    if (!strategy) return;
    strategy.applyDecrement();
  }

  // Modal / escape handling (unchanged)
  let activeModal = null;

  function handleEscape(e) {
    if (e.key === "Escape" && activeModal) {
      e.preventDefault();
      e.stopImmediatePropagation();
      e.stopPropagation();
      unmount(activeModal);
      activeModal = null;
    }
  }

  onDestroy(() => {
    if (activeModal) {
      unmount(activeModal);
      activeModal = null;
    }
  });

  // Non-shopping rolls (unchanged)
  async function Roll(e) {
    const proc = ProcedureFactory.Create(ProcedureFactory.type.attribute, {
      actor,
      args: { attributeKey: key, title: localize(localization[key]) }
    });

    DEBUG && !proc && LOG.error("Could not create attribute procedure.", [__FILE__, __LINE__]);

    const useComposer = actor?.sheet?.displayRollComposer && (e.shiftKey || proc.isOpposed);

    if (useComposer) {
      proc.setDefaultTNForComposer?.();
      if (proc.isOpposed && typeof proc.setOpposedEnabled === "function") {
        proc.setOpposedEnabled(true);
      }
      actor.sheet.displayRollComposer(proc);
    } else {
      await proc.execute();
    }
  }
</script>

<svelte:window on:keydown|capture={handleEscape} />

{#if $isShoppingState}
  <div class="stat-card" role="button" tabindex="0">
    <h4 class="no-margin uppercase">{localize(localization[key])}</h4>
    <div class="stat-card-background"></div>

    <div class="stat-label">
      <i
        class="fa-solid fa-circle-chevron-down decrement-attribute {canDecrement ? '' : 'disabled'}"
        role="button"
        tabindex="0"
        onclick={decrement}
        onkeydown={(e) => (e.key === "ArrowDown" || e.key === "s") && decrement()}
        title={canDecrement ? "" : "At minimum for this session"}
      ></i>

      <!-- uiDisplay is ALWAYS a store; safe to use $uiDisplay.sum -->
      <h1 class="stat-value">{$uiDisplay.sum}</h1>

      <i
        class="fa-solid fa-circle-chevron-up increment-attribute {canIncrement ? '' : 'disabled'}"
        role="button"
        tabindex="0"
        onclick={increment}
        onkeydown={(e) => (e.key === "ArrowUp" || e.key === "w") && increment()}
        title={canIncrement ? "" : "Cap reached or not enough Karma"}
      ></i>
    </div>
  </div>
{:else}
  <div
    class="stat-card button"
    role="button"
    tabindex="0"
    onclick={Roll}
    onkeydown={(e) => {
      if (e.key === "Enter" || e.key === " ") Roll(e);
    }}
  >
    <h4 class="no-margin uppercase">{localize(localization[key])}</h4>
    <div class="stat-card-background"></div>

    <div class="stat-label">
      <h1 class="stat-value">{$valueROStore.sum}</h1>
    </div>
  </div>
{/if}
