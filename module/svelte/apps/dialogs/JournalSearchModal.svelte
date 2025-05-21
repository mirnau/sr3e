<script>
    import { localize } from "../../../svelteHelpers.js";
    // @runes
    const { config, onclose } = $props();

    let visible = $state(true);
    let search = $state("");
    let selected = $state(null);
    let options = $state([]);
    let showDropdown = $state(false);
    let inputEl = $state(null);
    let dropdownStyle = $state("");

    $effect(() => {
        const journals = game.journal.contents;
        options = journals.flatMap((entry) => {
            const items = [
                { value: entry.id, type: "entry", label: entry.name },
            ];
            for (const page of entry.pages?.contents ?? []) {
                items.push({
                    value: page.id,
                    type: "page",
                    label: `${entry.name} › ${page.name}`,
                });
            }
            return items;
        });
    });

    $effect(() => {
        if (showDropdown && inputEl) {
            // Delay until input is painted
            requestAnimationFrame(() => {
                const rect = inputEl.getBoundingClientRect();
                dropdownStyle = `
                position: fixed;
                top: ${rect.bottom + 2}px;
                left: ${rect.left}px;
                width: ${rect.width}px;
                z-index: 1001;
            `;
            });
        }
    });

    function filteredOptions() {
        const q = search.toLowerCase().trim();
        return q
            ? options.filter((o) => o.label.toLowerCase().includes(q))
            : options;
    }

    function selectJournal(option) {
        selected = option;
        search = option.label;
        showDropdown = false;
    }

    function ok() {
        visible = false;
        onclose?.(selected);
    }

    function cancel() {
        visible = false;
        onclose?.(null);
    }
</script>

{#if visible}
    <div class="popup">
        <div class="popup-container">
            <div class="input-group">
                <input
                    bind:this={inputEl}
                    type="text"
                    placeholder={localize(config.sheet.searchJournals)}
                    bind:value={search}
                    oninput={() => {
                        showDropdown = true;
                        selected = null;
                    }}
                    onfocus={() => (showDropdown = true)}
                    onblur={() => setTimeout(() => (showDropdown = false), 100)}
                />
            </div>

            <div class="buttons">
                <button onclick={ok} disabled={!selected}>OK</button>
                <button onclick={cancel}>Cancel</button>
            </div>
        </div>

        {#if showDropdown}
            <ul class="dropdown-list floating" style={dropdownStyle}>
                {#if filteredOptions().length > 0}
                    {#each filteredOptions() as option (option.value)}
                        <li class="dropdown-item">
                            <div
                                role="option"
                                aria-selected={selected &&
                                    selected.value === option.value}
                                tabindex="0"
                                onmousedown={() => selectJournal(option)}
                            >
                                <i
                                    class="fa-solid fa-book-open"
                                    style="margin-right: 0.5rem;"
                                ></i>
                                {option.label}
                            </div>
                        </li>
                    {/each}
                {:else}
                    <li class="dropdown-empty">No journal entries found.</li>
                {/if}
            </ul>
        {/if}
    </div>
{/if}