<script lang="ts">
   import { localize } from "../../services/utilities";
   import { journalPageValue, type JournalOption } from "../common-components/journalViewerContent";
   import ItemSheetComponent from "../common-components/ItemSheetComponent.svelte";

   let {
      config,
      onclose,
      onselect,
   }: {
      config: any;
      onclose?: (result: JournalOption | null) => void;
      onselect?: (result: JournalOption) => void;
   } = $props();

   let search = $state("");
   let selected = $state<JournalOption | null>(null);
   let options = $state<JournalOption[]>([]);
   let showDropdown = $state(false);
   let inputEl = $state<HTMLInputElement | null>(null);
   let dropdownStyle = $state("");

   $effect(() => {
      options = game.journal.contents.flatMap((entry) => {
         const items: JournalOption[] = [
            { value: entry.id, type: "entry", label: entry.name, entryId: entry.id },
         ];

         for (const page of entry.pages?.contents ?? []) {
            items.push({
               value: journalPageValue(entry.id, page.id),
               type: "page",
               label: `${entry.name} > ${page.name}`,
               entryId: entry.id,
               pageId: page.id,
            });
         }

         return items;
      });
   });

   $effect(() => {
      if (showDropdown && inputEl) {
         requestAnimationFrame(() => {
            if (!inputEl) return;
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

   function filteredOptions(): JournalOption[] {
      const q = search.toLowerCase().trim();
      return q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
   }

   function selectJournal(option: JournalOption) {
      selected = option;
      search = option.label;
      showDropdown = false;
      onselect?.(option);
   }

   function ok() {
      onclose?.(selected);
   }

   function cancel() {
      onclose?.(null);
   }
</script>

<div class="journal-search-panel">
   <ItemSheetComponent>
      <div class="journal-search-controls">
         <label class="journal-search-input">
            <input
               bind:this={inputEl}
               type="text"
               placeholder={localize(config.sheet?.searchJournals)}
               bind:value={search}
               oninput={() => {
                  showDropdown = true;
                  selected = null;
               }}
               onfocus={() => (showDropdown = true)}
               onblur={() => setTimeout(() => (showDropdown = false), 100)}
            />
         </label>
         <div class="journal-search-actions">
            <button type="button" onclick={ok} disabled={!selected}>OK</button>
            <button type="button" onclick={cancel}>Cancel</button>
         </div>
      </div>
   </ItemSheetComponent>

   {#if showDropdown}
      <ul class="journal-search-results" style={dropdownStyle}>
         {#if filteredOptions().length > 0}
            {#each filteredOptions() as option (option.value)}
               <li class="dropdown-item">
                  <div
                     role="option"
                     aria-selected={selected && selected.value === option.value}
                     tabindex="0"
                     onmousedown={() => selectJournal(option)}
                  >
                     <i class="fa-solid fa-book-open" style="margin-right: 0.5rem;"></i>
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
