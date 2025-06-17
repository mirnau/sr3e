<script>
  import { localize, openFilePicker } from "../../svelteHelpers.js";
  import ActorDataService from "../../foundry/services/ActorDataService.js";
  import JournalViewer from "./components/JournalViewer.svelte";
  import { onMount } from "svelte";

  let { item, config } = $props();

  let layoutMode = $state("single");
  let formattedAmount = $state(`${item.system.amount} ¥`);

  // Simple reactive display value
  $effect(() => {
    formattedAmount = `${formatNumber(item.system.amount)} ¥`;
    item.upde;
  });

  // Function to format numbers with periods as thousand separators
  function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function handleInput(e) {
    let inputValue = e.target.value;

    // If the input is completely empty or just whitespace, set to 0
    if (!inputValue.trim()) {
      item.system.amount = 0;
      e.target.value = "0 ¥";
      return;
    }

    // Remove all non-digits to get the raw number
    const raw = inputValue.replace(/[^\d]/g, "");

    // Parse the number
    const parsed = parseInt(raw, 10) || 0;

    // Update the item amount
    item.system.amount = parsed;

    // Update the input field with formatted value
    e.target.value = `${formatNumber(parsed)} ¥`;
  }

  function handleKeyDown(e) {
    // Allow: backspace, delete, tab, escape, enter
    if (
      [8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
      // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      (e.keyCode === 65 && e.ctrlKey === true) ||
      (e.keyCode === 67 && e.ctrlKey === true) ||
      (e.keyCode === 86 && e.ctrlKey === true) ||
      (e.keyCode === 88 && e.ctrlKey === true) ||
      // Allow: home, end, left, right
      (e.keyCode >= 35 && e.keyCode <= 39)
    ) {
      return;
    }

    // Ensure that it is a number and stop the keypress
    if (
      (e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
      (e.keyCode < 96 || e.keyCode > 105)
    ) {
      e.preventDefault();
    }
  }

  function handleFocus(e) {
    // Select all text when focusing for easy editing
    e.target.select();
  }

  function handleBlur(e) {
    // Ensure the value is properly formatted when leaving the field
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
                placeholder="0 ¥"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <JournalViewer {item} {config} />
  </div>
</div>
