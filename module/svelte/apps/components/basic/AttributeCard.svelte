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

  // Local StoreManager (your pattern)
  let storeManager = StoreManager.Subscribe(actor);
  onDestroy(() => {
    StoreManager.Unsubscribe(actor);
  });

  // Mode flags
  let isShoppingState = storeManager.GetFlagStore(flags.actor.isShoppingState);
  let isCharacterCreationStore = storeManager.GetFlagStore(flags.actor.isCharacterCreation);

  // Actor values (default display when not in Karma session)
  let valueROStore = storeManager.GetSumROStore(`attributes.${key}`); // { value, mod, sum }

  // RML from metatype (never for magic)
  let metatype = $derived(actor.items.find((i) => i.type === "metatype") || null);
  let rml = $derived(
    key === "magic" || !metatype ? null : (metatype.system.attributeLimits?.[key] ?? null)
  );

  // Resources we touch to force recompute in Creation mode
  let creationPointsStore = storeManager.GetRWStore("creation.attributePoints");
  let goodKarmaStore = storeManager.GetRWStore("karma.goodKarma");
  let spentKarmaStore = storeManager.GetRWStore("karma.spentKarma");

  // Strategy and display store
  let strategy = null;

  // Always a STORE reference for the big number displayed
  let displayStore = valueROStore;

  // In Karma mode we also keep local refs to the strategy’s SESSION stores
  // so our $derived guards actually re-run when staged values change.
  let stagedBaseStore = null;
  let stagedSpentStore = null;

  $effect(() => {
    // Clean up existing strategy on mode switch
    if (strategy && typeof strategy.dispose === "function") {
      strategy.dispose();
    }
    strategy = null;
    stagedBaseStore = null;
    stagedSpentStore = null;

    if (!$isShoppingState) {
      displayStore = valueROStore; // non-shopping → live actor sum
      return;
    }

    const disallowKarmaRaise = key === "magic" || key === "essence" || key === "reaction";

    if ($isCharacterCreationStore) {
      strategy = new AttributeCreationShopping({
        actor,
        key,
        storeManager,
        rml: rml ?? null,
        max: rml ?? null
      });
      displayStore = valueROStore; // creation applies immediately to actor
    } else {
      strategy = new AttributeKarmaShopping({
        actor,
        key,
        storeManager,
        rml: rml ?? null,
        disallowRaise: disallowKarmaRaise,
        isShoppingStateStore: isShoppingState
      });
      // Pull session stores so the template reacts to staging
      stagedBaseStore = strategy.stagedBase;   // store
      stagedSpentStore = strategy.stagedSpent; // store
      displayStore = strategy.displayRO || valueROStore; // store
    }
  });

  // Guards — plain booleans (never use $ on them)
  let canIncrement = $derived(() => {
    if (!$isShoppingState) return false;
    if (!strategy) return false;

    // Touch relevant stores so this recomputes:
    if ($isCharacterCreationStore) {
      const _sum = $valueROStore.sum;
      const _pts = $creationPointsStore;
      return strategy.computeCanIncrement();
    } else {
      // Karma session: re-run on staged changes, not live karma (we use baseline inside strategy)
      const _stagedBase = stagedBaseStore ? $stagedBaseStore : 0;
      const _stagedSpent = stagedSpentStore ? $stagedSpentStore : 0;
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
      const _stagedBase = stagedBaseStore ? $stagedBaseStore : 0;
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
      {#if key !== "reaction"}
        <i
          class="fa-solid fa-circle-chevron-down decrement-attribute {canDecrement ? '' : 'disabled'}"
          role="button"
          tabindex="0"
          onclick={decrement}
          onkeydown={(e) => (e.key === "ArrowDown" || e.key === "s") && decrement()}
          title={canDecrement ? "" : "At minimum for this session"}
        ></i>
      {/if}

      <!-- displayStore is ALWAYS a store -->
      <h1 class="stat-value">{$displayStore.sum}</h1>

      {#if key !== "reaction"}
        <i
          class="fa-solid fa-circle-chevron-up increment-attribute {canIncrement ? '' : 'disabled'}"
          role="button"
          tabindex="0"
          onclick={increment}
          onkeydown={(e) => (e.key === "ArrowUp" || e.key === "w") && increment()}
          title={canIncrement ? "" : "Cap reached or not enough Karma"}
        ></i>
      {/if}
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
