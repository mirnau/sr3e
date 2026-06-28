<script lang="ts">
import { onMount, onDestroy } from "svelte";

type Option = { value: string; label: string };

let {
    options = [] as Option[],
    value = $bindable(""),
    placeholder = "Search...",
    nomatchtext = "No results found.",
    css = "",
    onselect = (_v: string, _l: string) => {},
}: {
    options?: Option[];
    value?: string;
    placeholder?: string;
    nomatchtext?: string;
    css?: string;
    onselect?: (value: string, label: string) => void;
} = $props();

let search = $state(options.find((o) => o.value === value)?.label ?? "");
let showDropdown = $state(false);
let inputEl = $state<HTMLInputElement | null>(null);
let portalEl = $state<HTMLElement | undefined>(undefined);

$effect(() => {
    const match = options.find((o) => o.value === value);
    if (match && !showDropdown) search = match.label;
});

$effect(() => {
    if (!portalEl) return;

    if (!showDropdown || !inputEl) {
        portalEl.style.display = "none";
        return;
    }

    const rect = inputEl.getBoundingClientRect();
    portalEl.style.cssText = `display:block;position:fixed;top:${rect.bottom + 2}px;left:${rect.left}px;width:${rect.width}px;z-index:9999;`;

    const q = search.toLowerCase().trim();
    const filtered = q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;

    portalEl.innerHTML = "";
    const ul = document.createElement("ul");
    ul.className = "journal-search-results";
    ul.style.cssText = "position:static;margin:0;max-height:200px;overflow-y:auto;";

    if (filtered.length > 0) {
        for (const opt of filtered) {
            const li = document.createElement("li");
            li.className = "dropdown-item";
            const div = document.createElement("div");
            div.setAttribute("role", "option");
            div.setAttribute("aria-selected", String(opt.value === value));
            div.setAttribute("tabindex", "0");
            div.textContent = opt.label;
            div.onmousedown = (e) => { e.preventDefault(); select(opt); };
            li.appendChild(div);
            ul.appendChild(li);
        }
    } else {
        const li = document.createElement("li");
        li.className = "dropdown-empty";
        li.textContent = nomatchtext;
        ul.appendChild(li);
    }

    portalEl.appendChild(ul);
});

function select(opt: Option) {
    value = opt.value;
    search = opt.label;
    showDropdown = false;
    onselect(opt.value, opt.label);
}

onMount(() => {
    portalEl = document.createElement("div");
    portalEl.className = "fuzzy-finder-portal";
    portalEl.style.display = "none";
    document.body.appendChild(portalEl);
});

onDestroy(() => {
    portalEl?.remove();
});
</script>

<div class="input-frame {css}">
    <input
        bind:this={inputEl}
        type="text"
        {placeholder}
        bind:value={search}
        oninput={() => { showDropdown = true; value = ""; }}
        onfocus={() => (showDropdown = true)}
        onblur={() => setTimeout(() => (showDropdown = false), 150)}
    />
</div>
