<script>
   import { tick } from "svelte";
   import { createEventDispatcher, onMount, onDestroy } from "svelte";
   const dispatch = createEventDispatcher();

   let {
      options = [],
      value = $bindable(""),
      placeholder = "Search...",
      nomatchplaceholder = "No matches found...",
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

   let displayValue = $derived(options.find((opt) => opt.value === value)?.label ?? "");

   $effect(() => {
      if (!isOpen) {
         searchTerm = displayValue;
      }
   });

   $effect(() => {
      if (searchTerm.trim() === "") {
         filteredOptions = options;
      } else {
         filteredOptions = options.filter((opt) => opt.label.toLowerCase().includes(searchTerm.toLowerCase()));
      }
      highlightedIndex = -1;
      updateDropdown();
   });

   onMount(() => {
      dropdownElement = document.createElement("div");
      dropdownElement.classList.add("combobox-dropdown");
      dropdownElement.id = "combobox-dropdown-list";
      dropdownElement.style.position = "absolute";
      dropdownElement.style.zIndex = "9999";

      const anchor = wrapperElement.closest(".item-sheet-component") ?? document.body;
      if (getComputedStyle(anchor).position === "static") {
         anchor.style.position = "relative";
      }
      anchor.appendChild(dropdownElement);

      document.addEventListener("click", handleDocumentClick);
      document.addEventListener("focusin", handleDocumentFocusIn);
   });

   onDestroy(() => {
      dropdownElement?.remove();
      document.removeEventListener("click", handleDocumentClick);
      document.removeEventListener("focusin", handleDocumentFocusIn);
   });

   function handleDocumentClick(event) {
      if (!wrapperElement || !dropdownElement) return;
      const clickedInside = wrapperElement.contains(event.target) || dropdownElement.contains(event.target);
      if (!clickedInside && isOpen) closeDropdown();
   }

   function handleDocumentFocusIn(event) {
      if (!wrapperElement || !dropdownElement) return;
      const focusedInside = wrapperElement.contains(event.target) || dropdownElement.contains(event.target);
      if (!focusedInside && isOpen) closeDropdown();
   }

   function closeDropdown() {
      isOpen = false;
      searchTerm = displayValue;
      updateDropdown();
   }

   function updateDropdown() {
      if (!wrapperElement || !dropdownElement) return;

      if (!isOpen) {
         dropdownElement.style.display = "none";
         return;
      }

      dropdownElement.style.display = "block";

      tick().then(() => {
         const anchor = wrapperElement.closest(".item-sheet-component");
         if (!anchor) return;

         const anchorRect = anchor.getBoundingClientRect();
         const wrapperRect = wrapperElement.getBoundingClientRect();

         dropdownElement.style.top = `${wrapperRect.bottom - anchorRect.top}px`;
         dropdownElement.style.left = `${wrapperRect.left - anchorRect.left}px`;
         dropdownElement.style.width = `${wrapperRect.width}px`;

         dropdownElement.innerHTML = "";
         const content = document.createElement("div");
         content.style.position = "relative";
         content.style.maxHeight = maxHeight;
         content.setAttribute("role", "listbox");

         if (filteredOptions.length) {
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
            el.textContent = nomatchplaceholder;
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

   function handleInputClick() {
      if (disabled) return;
      if (!isOpen) {
         isOpen = true;
         updateDropdown();
      }
   }

   function handleInputBlur() {}

   function handleInputKeydown(event) {
      if (disabled) return;

      switch (event.key) {
         case "ArrowDown":
            event.preventDefault();
            if (!isOpen) {
               isOpen = true;
               updateDropdown();
            } else {
               highlightedIndex = Math.min(highlightedIndex + 1, filteredOptions.length - 1);
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
            if (isOpen && highlightedIndex >= 0) selectOption(filteredOptions[highlightedIndex]);
            break;
         case "Escape":
            event.preventDefault();
            event.stopPropagation();
            if (isOpen) closeDropdown();
            else searchTerm = displayValue;
            break;
         case "Tab":
            closeDropdown();
            break;
      }
   }

   function selectOption(option) {
      value = option.value;
      searchTerm = option.label;
      closeDropdown();
      dispatch("select", { value: option.value });
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
         onclick={handleInputClick}
         onblur={handleInputBlur}
         onkeydown={handleInputKeydown}
         {placeholder}
         {disabled}
         class="combobox-input"
         class:open={isOpen}
         role="combobox"
         aria-expanded={isOpen}
         aria-haspopup="listbox"
         aria-controls="combobox-dropdown-list"
      />
      <i class="fa-solid fa-magnifying-glass combobox-icon" class:rotated={isOpen}></i>
   </div>
</div>
