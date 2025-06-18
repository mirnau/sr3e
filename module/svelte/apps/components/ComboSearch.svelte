<script>
  import { tick } from "svelte";
  import { createEventDispatcher, onMount, onDestroy } from "svelte";
  const dispatch = createEventDispatcher();

  let {
    options = [],
    value = $bindable(""),
    placeholder = "Search...",
    disabled = false,
    maxHeight = "200px",
  } = $props();

  let isOpen = $state(false);
  let searchTerm = $state("");
  let filteredOptions = $state([]);
  let highlightedIndex = $state(-1);
  let inputElement = $state();
  let wrapperElement = $state();
  let dropdownElement;

  let displayValue = $derived(
    options.find((opt) => opt.value === value)?.label ?? ""
  );

  $effect(() => {
    if (!isOpen) {
      searchTerm = displayValue;
    }
  });

  $effect(() => {
    if (searchTerm.trim() === "") {
      filteredOptions = options;
    } else {
      filteredOptions = options.filter((opt) =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    highlightedIndex = -1;
    updateDropdown();
  });

  onMount(() => {
    dropdownElement = document.createElement("div");
    dropdownElement.classList.add("combobox-dropdown");
    dropdownElement.style.position = "absolute";
    dropdownElement.style.zIndex = "9999";

    const anchor =
      wrapperElement.closest(".item-sheet-component") ?? document.body;
    if (getComputedStyle(anchor).position === "static") {
      anchor.style.position = "relative";
    }
    anchor.appendChild(dropdownElement);
  });

  onDestroy(() => {
    dropdownElement?.remove();
  });

  function updateDropdown() {
    if (!isOpen || !wrapperElement || !dropdownElement) return;
    tick().then(() => {
      const anchor = wrapperElement.closest(".item-sheet-component");
      if (!anchor) return;

      const anchorRect = anchor.getBoundingClientRect();
      const wrapperRect = wrapperElement.getBoundingClientRect();

      const top = wrapperRect.bottom - anchorRect.top;
      const left = wrapperRect.left - anchorRect.left;

      dropdownElement.style.top = `${top}px`;
      dropdownElement.style.left = `${left}px`;
      dropdownElement.style.width = `${wrapperRect.width}px`;

      dropdownElement.innerHTML = "";
      const content = document.createElement("div");
      content.style.maxHeight = maxHeight;
      content.setAttribute("role", "listbox");

      if (filteredOptions.length > 0) {
        filteredOptions.forEach((option, i) => {
          const el = document.createElement("div");
          el.className =
            "combobox-option" +
            (i === highlightedIndex ? " highlighted" : "") +
            (option.value === value ? " selected" : "");
          el.setAttribute("role", "option");
          el.setAttribute("aria-selected", option.value === value);
          el.textContent = option.label;
          el.onmousedown = () => handleOptionMousedown(option);
          content.appendChild(el);
        });
      } else if (searchTerm.trim() !== "") {
        const el = document.createElement("div");
        el.className = "combobox-option no-results";
        el.textContent = "No results found";
        content.appendChild(el);
      }

      dropdownElement.appendChild(content);
    });
  }

  function handleInputFocus() {
    if (!disabled) {
      isOpen = true;
      searchTerm = "";
      updateDropdown();
    }
  }

  function handleInputBlur() {
    setTimeout(() => {
      isOpen = false;
      searchTerm = displayValue;
      updateDropdown();
    }, 150);
  }

  function handleInputKeydown(event) {
    if (disabled) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!isOpen) {
          isOpen = true;
          updateDropdown();
        } else {
          highlightedIndex = Math.min(
            highlightedIndex + 1,
            filteredOptions.length - 1
          );
          scrollToHighlighted();
        }
        break;
      case "ArrowUp":
        event.preventDefault();
        highlightedIndex = Math.max(highlightedIndex - 1, 0);
        scrollToHighlighted();
        break;
      case "Enter":
        event.preventDefault();
        if (isOpen && highlightedIndex >= 0) {
          selectOption(filteredOptions[highlightedIndex]);
        }
        break;
      case "Escape":
        event.preventDefault();
        isOpen = false;
        searchTerm = displayValue;
        inputElement?.blur();
        updateDropdown();
        break;
      case "Tab":
        isOpen = false;
        searchTerm = displayValue;
        updateDropdown();
        break;
    }
  }

  function selectOption(option) {
    value = option.value;
    searchTerm = option.label;
    isOpen = false;
    inputElement?.blur();
    dispatch("select", { value: option.value });
    updateDropdown();
  }

  async function scrollToHighlighted() {
    await tick();
    const el = dropdownElement?.children[0]?.children?.[highlightedIndex];
    el?.scrollIntoView({ block: "nearest" });
  }

  function handleOptionMousedown(option) {
    selectOption(option);
  }
</script>

<div class="combobox-container">
  <div class="combobox-wrapper" class:disabled bind:this={wrapperElement}>
    <input
      bind:this={inputElement}
      bind:value={searchTerm}
      onfocus={handleInputFocus}
      onblur={handleInputBlur}
      onkeydown={handleInputKeydown}
      {placeholder}
      {disabled}
      class="combobox-input"
      class:open={isOpen}
      autocomplete="off"
      role="combobox"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
    />
    <i class="fa-solid fa-magnifying-glass combobox-icon" class:rotated={isOpen}
    ></i>
  </div>
</div>
