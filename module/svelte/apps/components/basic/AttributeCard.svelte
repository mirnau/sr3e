<script>
  import { localize } from "@services/utilities.js";
  import { flags } from "@services/commonConsts.js";
  import { StoreManager } from "@sveltehelpers/StoreManager.svelte";
  import { onDestroy } from "svelte";
  import { unmount } from "svelte";
  import { writable, get } from "svelte/store";
  import ProcedureFactory from "@services/procedure/FSM/ProcedureFactory.js";

  import AttributeCreationShopping from "@services/shopping/AttributeCreationShopping.js";
  import AttributeKarmaShopping from "@services/shopping/AttributeKarmaShopping.js";

  let { actor, localization, key, config } = $props();

  // StoreManager (local subscribe/unsubscribe)
  let storeManager = StoreManager.Subscribe(actor);
  onDestroy(() => {
    // Only roll back on close for Karma mode; creation is committed via the manager flow.
    try {
      if (strategy && typeof strategy.rollback === "function" && get(isShoppingState) && !get(isCharacterCreationStore)) {
        strategy.rollback();
      }
    } catch {}
    try { if (strategy && typeof strategy.dispose === "function") strategy.dispose(); } catch {}
    StoreManager.Unsubscribe(actor);
  });

  // Mode flags
  let isShoppingState = storeManager.GetFlagStore(flags.actor.isShoppingState);
  let isCharacterCreationStore = storeManager.GetFlagStore(flags.actor.isCharacterCreation);

  // Actor attribute stores
  let valueROStore = storeManager.GetSumROStore(`attributes.${key}`); // { value, mod, sum }

  // RML from metatype (never for magic), with alias fallback for robustness
  let metatype = $derived(actor.items.find((i) => i.type === "metatype") || null);
  let rml = $derived(
    key === "magic" || !metatype
      ? null
      : (() => {
          const limits = metatype.system.attributeLimits ?? {};
          const aliases = {
            strength: ["strength", "str"],
            quickness: ["quickness", "qui", "quick"],
            body: ["body", "bod"],
            charisma: ["charisma", "cha"],
            intelligence: ["intelligence", "int"],
            willpower: ["willpower", "wil", "will"],
          };
          const canonical = key;
          const candidates = aliases[canonical] ?? [canonical];
          for (const name of candidates) {
            const v = limits?.[name];
            if (typeof v === "number" && !Number.isNaN(v)) return v;
          }
          return null;
        })()
  );

  // Debug helper: track resolved RML per attribute
  $effect(() => {
    if (typeof DEBUG !== "undefined" && DEBUG && typeof LOG !== "undefined") {
      LOG.info?.(`AttributeCard: RML(${key}) = ${rml}`, [__FILE__, __LINE__]);
    }
  });

  // Resources we “touch” to recompute
  let creationPointsStore = storeManager.GetRWStore("creation.attributePoints");
  let goodKarmaStore = storeManager.GetRWStore("karma.goodKarma"); // int field in model

  // Strategy instance
  let strategy = null;

  // Stable UI store for the big number; we pipe the source into it.
  const uiDisplay = writable({ value: 0, mod: 0, sum: 0 });
  let unsubDisplay = null;

  // Chevron boolean stores provided by the strategy
  let canIncStore = writable(false);
  let canDecStore = writable(false);

  function pipeDisplay(fromStore) {
    unsubDisplay && unsubDisplay();
    unsubDisplay = null;

    if (!fromStore || typeof fromStore.subscribe !== "function") {
      uiDisplay.set({ value: 0, mod: 0, sum: 0 });
      return;
    }
    unsubDisplay = fromStore.subscribe((v) => {
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
    unsubDisplay && unsubDisplay();
    unsubDisplay = null;
  });

  // Strategy wiring and store routing
  $effect(() => {
    if (strategy && typeof strategy.dispose === "function") strategy.dispose();
    strategy = null;

    if (!$isShoppingState) {
      pipeDisplay(valueROStore);       // non-shopping: live actor sum
      // Reinitialize chevron stores (avoid calling .set on a derived store)
      canIncStore = writable(false);
      canDecStore = writable(false);
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
        disallowRaise: disallowCreationRaise,
        isShoppingStateStore: isShoppingState
      });
      // creation now stages base value; display stagedBase + mod
      pipeDisplay(strategy.displayRO);
      canIncStore = strategy.canIncrementRO;
      canDecStore = strategy.canDecrementRO;
    } else {
      strategy = new AttributeKarmaShopping({
        actor,
        key,
        storeManager,
        rml: rml ?? null,
        disallowRaise: disallowKarmaRaise,
        isShoppingStateStore: isShoppingState
      });
      pipeDisplay(strategy.displayRO); // stagedBase + mod
      canIncStore = strategy.canIncrementRO;
      canDecStore = strategy.canDecrementRO;
    }
  });

  // We still “touch” these to ensure any surrounding UI that uses them reacts.
  let _touchCreation = $derived(() => {
    if (!$isShoppingState) return 0;
    if ($isCharacterCreationStore) {
      const _sum = $valueROStore.sum;        // re-run on attribute change
      const _pts = $creationPointsStore;     // re-run on points change
    } else {
      const _stagedSum = $uiDisplay.sum;     // re-run on staging
      const _good = $goodKarmaStore;         // re-run on good karma change
    }
    return 0;
  });

  function increment() {
    // Only apply when chevrons allow it
    if (strategy && get(canIncStore)) strategy.applyIncrement();
  }
  function decrement() {
    // Only apply when chevrons allow it
    if (strategy && get(canDecStore)) strategy.applyDecrement();
  }

  // Escape modal handling (unchanged)
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

  async function Roll(e) {
    const proc = ProcedureFactory.Create(ProcedureFactory.type.attribute, {
      actor,
      args: { attributeKey: key, title: localize((localization && localization[key]) ?? (config?.attributes?.[key]) ?? key) }
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
        class="fa-solid fa-circle-chevron-down decrement-attribute {$canDecStore ? '' : 'disabled'}"
        role="button"
        tabindex="0"
        aria-disabled={!$canDecStore}
        onclick={decrement}
        onkeydown={(e) => (e.key === "ArrowDown" || e.key === "s") && decrement()}
        title={$canDecStore ? "" : "At minimum for this session"}
      ></i>

      <h1 class="stat-value">{$uiDisplay.sum}</h1>

      <i
        class="fa-solid fa-circle-chevron-up increment-attribute {$canIncStore ? '' : 'disabled'}"
        role="button"
        tabindex="0"
        aria-disabled={!$canIncStore}
        onclick={increment}
        onkeydown={(e) => (e.key === "ArrowUp" || e.key === "w") && increment()}
        title={$canIncStore ? "" : "Cap reached or not enough Karma"}
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

