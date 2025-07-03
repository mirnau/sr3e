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
   let searchTerm = $state(""); // only for searching when open, or to show selected label when closed
   let filteredOptions = $state([]);
   let highlightedIndex = $state(-1);
   let inputElement = $state();
   let wrapperElement = $state();
   let dropdownElement;

   $effect(() => {
      if (!isOpen) {
         const selected = options.find((o) => o.value === value);
         searchTerm = selected?.label ?? "";
      }
   });

   // Filter options when searching
   $effect(() => {
      if (isOpen) {
         filteredOptions =
            searchTerm.trim() === ""
               ? options
               : options.filter((o) => o.label.toLowerCase().includes(searchTerm.toLowerCase()));
         highlightedIndex = -1;
         updateDropdown();
      }
   });

   function openDropdown() {
      if (disabled || isOpen) return;
      isOpen = true;
      searchTerm = "";
      updateDropdown();
   }

   function closeDropdown() {
      isOpen = false;
      updateDropdown();
   }

   function handleInputFocus() {
      openDropdown();
   }

   function handleInputClick() {
      if (!isOpen) openDropdown();
   }

   function handleInputInput(e) {
      if (!isOpen) openDropdown();
      searchTerm = e.target.value;
   }

   function handleInputKeydown(e) {
      if (disabled) return;
      switch (e.key) {
         case "ArrowDown":
            e.preventDefault();
            if (!isOpen) openDropdown();
            highlightedIndex = Math.min(highlightedIndex + 1, filteredOptions.length - 1);
            scrollToHighlighted();
            break;
         case "ArrowUp":
            e.preventDefault();
            highlightedIndex = Math.max(highlightedIndex - 1, 0);
            scrollToHighlighted();
            break;
         case "Enter":
            e.preventDefault();
            if (isOpen && highlightedIndex >= 0) selectOption(filteredOptions[highlightedIndex]);
            break;
         case "Escape":
            e.preventDefault();
            e.stopPropagation();
            if (isOpen) closeDropdown();
            break;
         case "Tab":
            closeDropdown();
            break;
      }
   }

   function selectOption(opt) {
      value = opt.value;
      // searchTerm will be synced by effect after dropdown closes
      closeDropdown();
      dispatch("select", { value: opt.value });
   }

   async function scrollToHighlighted() {
      await tick();
      const el = dropdownElement?.children[0]?.children?.[highlightedIndex];
      el?.scrollIntoView({ block: "nearest" });
   }

   onMount(() => {
      dropdownElement = document.createElement("div");
      dropdownElement.classList.add("combobox-dropdown");
      dropdownElement.id = "combobox-dropdown-list";
      dropdownElement.style.position = "absolute";
      dropdownElement.style.zIndex = "9999";
      const anchor = wrapperElement.closest(".item-sheet-component") ?? document.body;
      if (getComputedStyle(anchor).position === "static") anchor.style.position = "relative";
      anchor.appendChild(dropdownElement);

      document.addEventListener("click", handleDocumentClick);
      document.addEventListener("focusin", handleDocumentFocusIn);
   });

   onDestroy(() => {
      dropdownElement?.remove();
      document.removeEventListener("click", handleDocumentClick);
      document.removeEventListener("focusin", handleDocumentFocusIn);
   });

   function updateDropdown() {
      if (!wrapperElement || !dropdownElement) return;
      dropdownElement.style.display = isOpen ? "block" : "none";
      if (!isOpen) return;

      tick().then(() => {
         const anchor = wrapperElement.closest(".item-sheet-component");
         if (!anchor) return;
         const aRect = anchor.getBoundingClientRect();
         const wRect = wrapperElement.getBoundingClientRect();

         dropdownElement.style.top = `${wRect.bottom - aRect.top}px`;
         dropdownElement.style.left = `${wRect.left - aRect.left}px`;
         dropdownElement.style.width = `${wRect.width}px`;

         dropdownElement.innerHTML = "";
         const list = document.createElement("div");
         list.style.position = "relative";
         list.style.maxHeight = maxHeight;
         list.setAttribute("role", "listbox");

         if (filteredOptions.length) {
            filteredOptions.forEach((opt, i) => {
               const el = document.createElement("div");
               el.className =
                  "combobox-option" +
                  (i === highlightedIndex ? " highlighted" : "") +
                  (opt.value === value ? " selected" : "");
               el.setAttribute("role", "option");
               el.setAttribute("aria-selected", opt.value === value);
               el.textContent = opt.label;
               el.onmousedown = () => selectOption(opt);
               list.appendChild(el);
            });
         } else if (searchTerm.trim() !== "") {
            const el = document.createElement("div");
            el.className = "combobox-option no-results";
            el.textContent = nomatchplaceholder;
            list.appendChild(el);
         }

         dropdownElement.appendChild(list);
      });
   }

   function handleDocumentClick(e) {
      if (!isOpen) return;
      const inside = wrapperElement.contains(e.target) || dropdownElement.contains(e.target);
      if (!inside) closeDropdown();
   }

   function handleDocumentFocusIn(e) {
      if (!isOpen) return;
      const inside = wrapperElement.contains(e.target) || dropdownElement.contains(e.target);
      if (!inside) closeDropdown();
   }
</script>

<div class="combobox-container">
   <div class="combobox-wrapper" class:disabled bind:this={wrapperElement}>
      <input
         bind:this={inputElement}
         bind:value={searchTerm}
         {placeholder}
         {disabled}
         class="combobox-input"
         class:open={isOpen}
         role="combobox"
         aria-expanded={isOpen}
         aria-haspopup="listbox"
         aria-controls="combobox-dropdown-list"
         onfocus={handleInputFocus}
         onclick={handleInputClick}
         oninput={handleInputInput}
         onkeydown={handleInputKeydown}
      />
      <i class="fa-solid fa-magnifying-glass combobox-icon" class:rotated={isOpen}></i>
   </div>
</div>
