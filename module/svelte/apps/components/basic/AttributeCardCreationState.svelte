<script>
  import { localize } from "../../../../services/utilities.js";
  import { getActorStore, stores } from "../../../stores/actorStores.js";
  import { flags } from "../../../../services/commonConsts.js";

  let { actor, stat, localization, key } = $props();

  const attributePointStore = actor.getStore("creation.attributePoints");

  let value = actor.getStore(`attributes.${key}.value`);
  let mod = actor.getStore(`attributes.${key}.mod`);
  let total = $derived($value + $mod + (stat?.meta ?? 0));

  let attributeAssignmentLocked = getActorStore(
    actor.id,
    stores.attributeAssignmentLocked,
    actor.getFlag(flags.sr3e, flags.actor.attributeAssignmentLocked)
  );

  let metaHuman = $derived(
    "meta" in stat && actor?.items
      ? actor.items.find((i) => i.type === "metahuman")
      : null
  );

  let attributeLimit = $derived(
    key === "magic" || !("meta" in stat)
      ? null
      : metaHuman?.system?.attributeLimits?.[key] ?? 0
  );

  let isMinLimit = $derived($value <= 1);
  let isMaxLimit = $derived(attributeLimit ? total >= attributeLimit : false);

  function add(change) {
    if (!$attributeAssignmentLocked) {
      const newPoints = $attributePointStore - change;
      if (newPoints < 0) return;

      $value += change;
      $attributePointStore = newPoints;
    }
  }

  const increment = () => {
    if (!isMaxLimit) add(1);
  };

  const decrement = () => {
    if (!isMinLimit) add(-1);
  };
</script>

<div class="stat-card">
  <h4 class="no-margin uppercase">{localize(localization[key])}</h4>
  <div class="stat-card-background"></div>

  <div class="stat-label">
    {#if "meta" in stat}
      <i
        class="fa-solid fa-circle-chevron-down decrement-attribute {isMinLimit ? 'disabled' : ''}"
        role="button" tabindex="0"
        onclick={decrement}
        onkeydown={(e) => (e.key === "ArrowDown" || e.key === "s") && decrement()}
      ></i>
    {/if}

    <h1 class="stat-value">{total}</h1>

    {#if "meta" in stat}
      <i
        class="fa-solid fa-circle-chevron-up increment-attribute {(isMaxLimit || $attributePointStore === 0) ? 'disabled' : ''}"
        role="button" tabindex="0"
        onclick={increment}
        onkeydown={(e) => (e.key === "ArrowUp" || e.key === "w") && increment()}
      ></i>
    {/if}
  </div>
</div>
