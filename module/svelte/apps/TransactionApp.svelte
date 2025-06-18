<script>
  import { onMount, onDestroy } from "svelte";
  import { localize, openFilePicker } from "../../svelteHelpers.js";
  import ActorDataService from "../../foundry/services/ActorDataService.js";
  import ComboSearch from "./components/ComboSearch.svelte";
  import JournalViewer from "./components/JournalViewer.svelte";

  let { item, config } = $props();

  let layoutMode = $state("single");
  let formattedAmount = $state(`${item.system.amount} ¥`);

  let creditorOptions = $state([]);
  let selectedId = $state(item.system.creditorId ?? "");
  let delimiter = $state("");

  // Format display string
  $effect(() => {
    formattedAmount = `${formatNumber(item.system.amount)} ¥`;
  });

  // Build options from game actors
  $effect(() => {
    const actors = game.actors;
    const filtered =
      delimiter.trim().length > 0
        ? actors.filter((a) =>
            a.name.toLowerCase().includes(delimiter.toLowerCase())
          )
        : actors;

    creditorOptions = filtered.map((a) => ({
      value: a.id,
      label: a.name,
    }));
  });

  function handleSelection(event) {
    const id = event.detail.value;
    selectedId = id;
    item.update({ "system.creditorId": id });
  }

  function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function handleInput(e) {
    const inputValue = e.target.value.trim();
    const raw = inputValue.replace(/[^\d]/g, "");
    const parsed = parseInt(raw, 10) || 0;
    item.system.amount = parsed;
    e.target.value = `${formatNumber(parsed)} ¥`;
  }

  function handleKeyDown(e) {
    if (
      [8, 9, 27, 13, 46].includes(e.keyCode) ||
      (e.ctrlKey && [65, 67, 86, 88].includes(e.keyCode)) ||
      (e.keyCode >= 35 && e.keyCode <= 39)
    )
      return;

    if (
      (e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
      (e.keyCode < 96 || e.keyCode > 105)
    ) {
      e.preventDefault();
    }
  }

  function handleFocus(e) {
    e.target.select();
  }

  function handleBlur(e) {
    const raw = e.target.value.replace(/[^\d]/g, "");
    const parsed = parseInt(raw, 10) || 0;
    item.system.amount = parsed;
    item.update({ "system.amount": parsed }, { render: false });
    e.target.value = `${formatNumber(parsed)} ¥`;
  }
</script>

<div class="sr3e-waterfall-wrapper">
  <div class={`sr3e-waterfall sr3e-waterfall--${layoutMode}`}>
    <div class="item-sheet-component">
      <div class="sr3e-inner-background-container">
        <div class="fake-shadow"></div>
        <div class="sr3e-inner-background">
          <div class="image-mask">
            <img
              src={item.img}
              role="presentation"
              data-edit="img"
              title={item.name}
              alt={item.name}
              onclick={async () => openFilePicker(item)}
            />
          </div>

          <div class="stat-grid single-column">
            <div class="stat-card">
              <div class="stat-card-background"></div>
              <input
                class="large"
                name="name"
                type="text"
                value={item.name}
                onchange={(e) => item.update({ name: e.target.value })}
              />
            </div>

            <!-- Nuyen Amount Input -->
            <div class="stat-card">
              <div class="stat-card-background"></div>
              <input
                class="large"
                name="amount"
                type="text"
                value={formattedAmount}
                oninput={handleInput}
                onkeydown={handleKeyDown}
                onfocus={handleFocus}
                onblur={handleBlur}
                placeholder="0.00 %"
              />
            </div>
            <div class="stat-card">
              <div class="stat-card-background"></div>
              <select
                name="type"
                bind:value={item.system.type}
                onchange={(e) => item.update({ "system.type": e.target.value })}
              >
                <option value="" disabled
                  >{localize(config.transaction.select)}</option
                >
                <option value="income"
                  >{localize(config.transaction.income)}</option
                >
                <option value="asset"
                  >{localize(config.transaction.asset)}</option
                >
                <option value="debt">{localize(config.transaction.debt)}</option
                >
                <option value="expense"
                  >{localize(config.transaction.expense)}</option
                >
              </select>
            </div>
            <input type="text" bind:value={delimiter} placeholder="Search..." />
            <div class="stat-grid two-column">
              <div class="stat-card">
                <div class="stat-card-background"></div>
                <h4>{localize(config.transaction.recurrent)}</h4>
                <input type="checkbox" bind:value={item.isRecurrent} />
              </div>
              <div class="stat-card">
                <h4>{localize(config.transaction.creditstick)}</h4>
                <div class="stat-card-background"></div>
                <input type="checkbox" bind:value={item.isCreditStick} />
              </div>
            </div>
          </div>
        </div>
      </div>
      {#if item.system.type !== "asset"}
        <div class="item-sheet-component">
          <div class="sr3e-inner-background-container">
            <div class="fake-shadow"></div>
            <div class="sr3e-inner-background">
              <div class="stat-grid single-column">
                <div class="stat-card">
                  <div class="stat-card-background"></div>
                  <h3>Creditor</h3>
                </div>
                
                <ComboSearch
                  options={creditorOptions}
                  placeholder={localize(config.combosearch.search)}
                  nomatchplaceholder={localize(config.combosearch.noresult)}
                  bind:value={selectedId}
                  on:select={handleSelection}
                />

              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
    <JournalViewer {item} {config} />
  </div>
</div>
