<script>
  import { localize } from "../../../svelteHelpers.js";
  import { getActorStore, stores } from "../../stores/actorStores.js";
  import { flags } from "../../../foundry/services/commonConsts.js";

  let { actor, stat, localization, key } = $props();

  const attributePointStore = getActorStore(actor.id, stores.attributePoints);

  let value = $state(stat?.value ?? 0);
  let mod = $state(stat?.mod ?? 0);
  let total = $derived(value + mod + (stat?.meta ?? 0));

  let attributeAssignmentLocked = getActorStore(
    actor.id,
    stores.attributeAssignmentLocked,
    actor.getFlag(flags.sr3e, flags.actor.attributeAssignmentLocked),
  );

  let intelligenceStore = getActorStore(actor.id, stores.intelligence);

  // Only calculate metaHuman and attributeLimit for ComplexStat attributes (not magic)
  let metaHuman = $derived(
    (() => {
      if (!("meta" in stat) || !actor?.items) return null;
      return actor.items.find((i) => i.type === "metahuman");
    })(),
  );

  let attributeLimit = $derived(
    key === "magic" || !("meta" in stat)
      ? null
      : (metaHuman?.system?.attributeLimits?.[key] ?? 0),
  );

  let isMinLimit = $derived(value <= 1);
  let isMaxLimit = $derived(attributeLimit ? total >= attributeLimit : false);

  function add(change) {
    if (!$attributeAssignmentLocked) {
      const newPoints = $attributePointStore + change * -1;
      if (newPoints < 0) return;

      stat.value += change;
      $attributePointStore = newPoints;

      actor.update(
        {
          [`system.attributes.${key}.value`]: stat.value,
          "system.creation.attributePoints": $attributePointStore,
        },
        { render: false },
      );

      intelligenceStore.set(
        actor.system.attributes.intelligence.value +
          actor.system.attributes.intelligence.mod +
          actor.system.attributes.intelligence.meta ?? 0,
      );
    } else {
      console.warn("There is an error in charactercreation")
    }
  }

  const increment = () => {
    if (!attributeLimit || total < attributeLimit) {
      add(1);
    } else {
    }
  };

  const decrement = () => {
    if (isMinLimit) return;
    if (total > 0) add(-1);
  };

  $effect(() => {
    if (stat) {
      value = stat.value;
      mod = stat.mod;
    }
  });
</script>

<div class="stat-card">
  <h4 class="no-margin">{localize(localization[key])}</h4>
  <div class="stat-card-background"></div>

  {#if "meta" in stat}
    <div class="stat-label">
      <i
        class="fa-solid fa-circle-chevron-down decrement-attribute {isMinLimit
          ? 'disabled'
          : ''}"
        role="button"
        tabindex="0"
        onclick={decrement}
        onkeydown={(e) =>
          (e.key === "ArrowDown" || e.key === "s") && decrement()}
      ></i>

      <h1 class="stat-value">{total}</h1>

      <i
        class="fa-solid fa-circle-chevron-up increment-attribute {isMaxLimit ||
        $attributePointStore === 0
          ? 'disabled'
          : ''}"
        role="button"
        tabindex="0"
        onclick={increment}
        onkeydown={(e) => (e.key === "ArrowUp" || e.key === "w") && increment()}
      ></i>
    </div>
  {:else}
    <h1 class="stat-value">{total}</h1>
  {/if}
</div>
