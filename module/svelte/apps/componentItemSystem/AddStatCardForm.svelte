<script>
  let { statTypes, onDataChange } = $props();

  let statName = $state('');
  let statType = $state(statTypes[0]?.type || '');
  let currencySymbol = $state('¥');
  let currencyRate = $state(1);

  let selectedStatConfig = $derived(statTypes.find(t => t.type === statType));
  let isCurrency = $derived(selectedStatConfig?.name === 'Currency');

  // Effect to call onDataChange whenever form data changes
  $effect(() => {
    onDataChange({
      statName,
      statType,
      currencySymbol,
      currencyRate
    });
  });
</script>

<form>
  <div class="form-group">
    <label for="stat-name">Stat Name</label>
    <input 
      type="text" 
      id="stat-name"
      bind:value={statName}
      placeholder="e.g. Coolness" 
    />
  </div>

  <div class="form-group">
    <label for="stat-type">Stat Type</label>
    <select id="stat-type" bind:value={statType}>
      {#each statTypes as statTypeOption}
        <option value={statTypeOption.type}>{statTypeOption.name}</option>
      {/each}
    </select>
  </div>

  {#if isCurrency}
    <div class="form-group currency-fields">
      <label for="currency-symbol">Currency Symbol</label>
      <input 
        type="text" 
        id="currency-symbol"
        bind:value={currencySymbol}
        placeholder="e.g. ¥" 
      />
    </div>

    <div class="form-group currency-fields">
      <label for="currency-rate">Exchange Rate (vs ¥)</label>
      <input 
        type="number" 
        id="currency-rate"
        bind:value={currencyRate}
        step="0.01" 
      />
    </div>
  {/if}
</form>

<style>
  .form-group {
    margin-bottom: 1rem;
  }

  label {
    display: block;
    margin-bottom: 0.25rem;
    font-weight: bold;
  }

  input, select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .currency-fields {
    animation: slideIn 0.2s ease-out;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>