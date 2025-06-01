<script>
  import { localize } from "../../../svelteHelpers.js";

  let { actor, stat, localization, key, isShoppingState } = $props();

  // Option 2: Local state with proper synchronization
  let value = $state(stat.value);
  let mod = $state(stat.mod);
  
  // Keep local state in sync with stat changes
  $effect(() => {
    value = stat.value;
    mod = stat.mod;
  });
  
  let baseTotal = $derived(value + mod);
  let total = $derived(baseTotal + (stat.meta ?? 0));
  let metaHuman = $derived(actor.items.find((i) => i.type === "metahuman"));
  let attributeLimit = $derived(metaHuman.system.attributeLimits[key]);

  function add(change) {
    console.log("Entered Add Method");
    stat.value += change;
    actor.update(
      { [`system.attributes.${key}.value`]: stat.value }, // Use stat.value instead of local value
      { render: false },
    );
    console.log("Exited Add Method");
  }

  const increment = () => {
    console.log("Increment called, total:", total, "limit:", attributeLimit);
    if (total < attributeLimit) add(1);
  };
  
  const decrement = () => {
    console.log("Decrement called, total:", total);
    if (total > 0) add(-1);
  };
</script>

<div class="stat-card">
  <h4 class="no-margin">{localize(localization[key])}</h4>
  {#if "meta" in stat}
    <div class="stat-label">
      {#if isShoppingState}
        <i
          class="fa-solid fa-circle-chevron-down decrement-attribute"
          role="button"
          tabindex="0"
          onclick={decrement}
          onkeydown={(e) => (e.key === "ArrowDown" || e.key === "s") && decrement()}
        ></i>
      {/if}
      <h1 class="stat-value">{total}</h1>
      <i
        class="fa-solid fa-circle-chevron-up increment-attribute"
        role="button"
        tabindex="0"
        onclick={increment}
        onkeydown={(e) => (e.key === "ArrowUp" || e.key === "w") && increment()}
      ></i>
    </div>
  {:else}
    <h1 class="stat-value">{baseTotal}</h1>
  {/if}
</div>