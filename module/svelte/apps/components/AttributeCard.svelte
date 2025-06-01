<script>
  import { localize } from "../../../svelteHelpers.js";

  let { actor, stat, localization, key, isShoppingState } = $props();

  console.log("ACTOR", actor);
  console.log("Component initialized for key:", key);
  console.log("Stat structure:", stat);
  console.log("Has meta:", "meta" in stat);

  let value = $state(stat?.value ?? 0);
  let mod = $state(stat?.mod ?? 0);
  let total = $derived(value + mod + (stat?.meta ?? 0));

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
    if (!actor || !stat) return;

    console.log("Entered Add Method for", key);

    stat.value += change;
    actor.update(
      { [`system.attributes.${key}.value`]: stat.value },
      { render: false },
    );

    console.log("Exited Add Method");
  }

  const increment = () => {
    console.log("=== INCREMENT DEBUG ===");
    console.log("attributeLimit:", attributeLimit);
    console.log("total:", total);
    console.log("!attributeLimit:", !attributeLimit);
    console.log("total < attributeLimit:", total < attributeLimit);
    console.log("Final condition:", !attributeLimit || total < attributeLimit);

    if (!attributeLimit || total < attributeLimit) {
      add(1);
    } else {
      console.log("BLOCKED: Increment prevented by limit check");
    }
  };
  const decrement = () => {
    if (isMinLimit) return;
    console.log("Decrement called, total:", total);
    if (total > 0) add(-1);
  };

  $effect(() => {
    if (stat) {
      value = stat.value;
      mod = stat.mod;
    }
  });
</script>

<!-- Only render if we have the required data -->
{#if stat && localization}
  <div class="stat-card">
    <h4 class="no-margin">{localize(localization[key])}</h4>
    {#if "meta" in stat}
      <!-- ComplexStat: Show increment/decrement controls -->
      <div class="stat-label">
        {#if isShoppingState && actor}
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
        {/if}
        <h1 class="stat-value">{total}</h1>
        {#if actor}
          <i
            class="fa-solid fa-circle-chevron-up increment-attribute {isMaxLimit
              ? 'disabled'
              : ''}"
            role="button"
            tabindex="0"
            onclick={increment}
            onkeydown={(e) =>
              (e.key === "ArrowUp" || e.key === "w") && increment()}
          ></i>
        {/if}
      </div>
    {:else}
      <!-- SimpleStat: Read-only display (like magic) -->
      <h1 class="stat-value">{total}</h1>
    {/if}
  </div>
{:else}
  <!-- Loading placeholder -->
  <div class="stat-card loading">
    <div class="loading-placeholder">Loading {key}...</div>
  </div>
{/if}
