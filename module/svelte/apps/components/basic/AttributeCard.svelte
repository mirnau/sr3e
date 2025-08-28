<script>
  import { localize } from "@services/utilities.js";
  import { flags } from "@services/commonConsts.js";
  import { StoreManager } from "@sveltehelpers/StoreManager.svelte";
  import { onDestroy } from "svelte";
  import { unmount } from "svelte";
  import ProcedureFactory from "@services/procedure/FSM/ProcedureFactory.js";

  import AttributeCreationShopping from "@services/shopping/AttributeCreationShopping.js";
  import AttributeKarmaShopping from "@services/shopping/AttributeKarmaShopping.js";

  let { actor, localization, key } = $props();

  // Local StoreManager (subscribe/unsubscribe locally)
  let storeManager = StoreManager.Subscribe(actor);
  onDestroy(() => {
    StoreManager.Unsubscribe(actor);
  });

  // Mode flags
  let isShoppingState = storeManager.GetFlagStore(flags.actor.isShoppingState);
  let isCharacterCreationStore = storeManager.GetFlagStore(flags.actor.isCharacterCreation);

  // Actor attribute stores
  // valueROStore is a SUM RO store that returns { value, mod, sum }
  let valueROStore = storeManager.GetSumROStore(`attributes.${key}`);

  // RML from metatype (never for magic)
  let metatype = $derived(actor.items.find((i) => i.type === "metatype") || null);
  let rml = $derived(
    key === "magic" || !metatype ? null : (metatype.system.attributeLimits?.[key] ?? null)
  );

  // Resource stores we touch for reactivity in guards
  let creationPointsStore = storeManager.GetRWStore("creation.attributePoints");
  let goodKarmaStore = storeManager.GetRWStore("karma.goodKarma");

  // Strategy instance and which store to display
  let strategy = null;
  // displayStore is ALWAYS a Svelte store with { value, mod, sum }
  // - Creation or non-shopping: valueROStore
  // - Karma session: strategy.displayRO (stagedBase + mod)
  let displayStore = valueROStore;

  $effect(() => {
    // Dispose old strategy if present
    if (strategy && typeof strategy.dispose === "function") {
      strategy.dispose();
    }
    strategy = null;

    if (!$isShoppingState) {
      // Not shopping: show live actor sum
      displayStore = valueROStore;
      return;
    }

    const disallowKarmaRaise = key === "reaction" || key === "magic" || key === "essence";
    const disallowCreationRaise = key === "reaction";

    if ($isCharacterCreationStore) {
      // Character creation: immediate apply, capped by RML; reaction is not buyable
      strategy = new AttributeCreationShopping({
        actor,
        key,
        storeManager,
        rml: rml ?? null,
        max: rml ?? null,
        disallowRaise: disallowCreationRaise
      });
      displayStore = valueROStore;
    } else {
      // Karma session: staged buys, canonical SR3E costs (2× up to RML, 3× above RML),
      // cap at Attribute Maximum (computed in strategy), not buyable: reaction/magic/essence
      strategy = new AttributeKarmaShopping({
        actor,
        key,
        storeManager,
        rml: rml ?? null,
        disallowRaise: disallowKarmaRaise,
        isShoppingStateStore: isShoppingState
      });
      displayStore = strategy.displayRO || valueROStore;
    }
  });

  // Chevron guards (plain booleans; do NOT use $ on them)
  // Each guard "touches" stores so it recomputes when relevant data changes.
  let canIncrement = $derived(() => {
    if (!$isShoppingState) return false;
    if (!strategy) return false;

    if ($isCharacterCreationStore) {
      // Re-run when the actor's displayed sum or creation points change
      const _sum = $valueROStore.sum;
      const _pts = $creationPointsStore;
      return strategy.computeCanIncrement();
    } else {
      // Re-run when the staged display sum changes (stagedBase + mod) or good karma changes
      const _stagedSum = $displayStore.sum;
      const _good = $goodKarmaStore;
      return strategy.computeCanIncrement();
    }
  });

  let canDecrement = $derived(() => {
    if (!$isShoppingState) return false;
    if (!strategy) return false;

    if ($isCharacterCreationStore) {
      const _sum = $valueROStore.sum;
      return strategy.computeCanDecrement();
    } else {
      const _stagedSum = $displayStore.sum;
      return strategy.computeCanDecrement();
    }
  });

  function increment() {
    if (!strategy) return;
    strategy.applyIncrement();
  }

  function decrement() {
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

      <!-- displayStore is ALWAYS a store; safe to use $displayStore.sum -->
      <h1 class="stat-value">{$displayStore.sum}</h1>

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
