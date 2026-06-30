<script lang="ts">
import { tick, onMount, onDestroy } from "svelte";

type Option = { value: string; label: string };

let {
    options = [] as Option[],
    value = $bindable(""),
    placeholder = "Search...",
    nomatchplaceholder = "No matches found...",
    disabled = false,
    maxHeight = "200px",
    css = "",
    onselect = (_v: string) => {},
}: {
    options?: Option[];
    value?: string;
    placeholder?: string;
    nomatchplaceholder?: string;
    disabled?: boolean;
    maxHeight?: string;
    css?: string;
    onselect?: (value: string) => void;
} = $props();

let isOpen = $state(false);
let searchTerm = $state("");
let filteredOptions = $state<Option[]>([]);
let highlightedIndex = $state(-1);
let inputElement = $state<HTMLInputElement | undefined>(undefined);
let wrapperElement = $state<HTMLElement | undefined>(undefined);
let dropdownElement: HTMLElement | undefined;

$effect(() => {
    if (!isOpen) {
        const selected = options.find((o) => o.value === value);
        searchTerm = selected?.label ?? "";
    }
});

$effect(() => {
    const filtered =
        searchTerm.trim() === ""
            ? options
            : options.filter((o) => matchesSearch(o, searchTerm));

    filteredOptions = isOpen ? filtered : filtered;
    if (isOpen) {
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

function matchesSearch(option: Option, term: string): boolean {
    const query = term.toLowerCase();
    return option.label.toLowerCase().includes(query)
        || option.value.toLowerCase().includes(query);
}

function closeDropdown() {
    isOpen = false;
    updateDropdown();
}

function selectOption(opt: Option) {
    value = opt.value;
    closeDropdown();
    onselect(opt.value);
}

async function scrollToHighlighted() {
    await tick();
    const el = dropdownElement?.children[0]?.children?.[highlightedIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
}

function handleInputKeydown(e: KeyboardEvent) {
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

function updateDropdown() {
    if (!wrapperElement || !dropdownElement) return;
    dropdownElement.style.display = isOpen ? "block" : "none";
    if (!isOpen) return;

    tick().then(() => {
        if (!wrapperElement || !dropdownElement) return;
        const anchor = wrapperElement.closest(".item-sheet-component") as HTMLElement | null;
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
        list.style.overflowY = "auto";
        list.setAttribute("role", "listbox");

        if (filteredOptions.length) {
            filteredOptions.forEach((opt, i) => {
                const el = document.createElement("div");
                el.className =
                    "combobox-option" +
                    (i === highlightedIndex ? " highlighted" : "") +
                    (opt.value === value ? " selected" : "");
                el.setAttribute("role", "option");
                el.setAttribute("aria-selected", String(opt.value === value));
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

function handleDocumentClick(e: MouseEvent) {
    if (!isOpen) return;
    const target = e.target as Node;
    const inside = wrapperElement?.contains(target) || dropdownElement?.contains(target);
    if (!inside) closeDropdown();
}

function handleDocumentFocusIn(e: FocusEvent) {
    if (!isOpen) return;
    const target = e.target as Node;
    const inside = wrapperElement?.contains(target) || dropdownElement?.contains(target);
    if (!inside) closeDropdown();
}

onMount(() => {
    dropdownElement = document.createElement("div");
    dropdownElement.classList.add("combobox-dropdown");
    dropdownElement.id = "combobox-dropdown-list";
    dropdownElement.style.position = "absolute";
    dropdownElement.style.zIndex = "9999";
    const anchor = (wrapperElement?.closest(".item-sheet-component") ?? document.body) as HTMLElement;
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
</script>

<div class="combobox-container">
    <div class={`combobox-wrapper ${css}`} class:disabled bind:this={wrapperElement}>
        <input
            bind:this={inputElement}
            bind:value={searchTerm}
            {placeholder}
            {disabled}
            class={`combobox-input ${css}`}
            class:open={isOpen}
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-controls="combobox-dropdown-list"
            onfocus={openDropdown}
            onclick={() => { if (!isOpen) openDropdown(); }}
            oninput={(e) => { if (!isOpen) openDropdown(); searchTerm = (e.target as HTMLInputElement).value; }}
            onkeydown={handleInputKeydown}
        />
        <i class="fa-solid fa-magnifying-glass combobox-icon" class:rotated={isOpen}></i>
    </div>
</div>
