<script lang="ts">
   import { localize } from "../../services/utilities";
   import { journalPageValue, type JournalOption } from "../common-components/journalViewerContent";
   import ItemSheetComponent from "../common-components/ItemSheetComponent.svelte";
   import FuzzyFinder from "../common-components/FuzzyFinder.svelte";

   let {
      config,
      onclose,
      onselect,
   }: {
      config: any;
      onclose?: (result: JournalOption | null) => void;
      onselect?: (result: JournalOption) => void;
   } = $props();

   let selected = $state<JournalOption | null>(null);
   let selectedValue = $state("");
   let options = $state<JournalOption[]>([]);

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

   function selectJournal(value: string) {
      const option = options.find((o) => o.value === value) ?? null;
      selected = option;
      if (option) onselect?.(option);
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
         <FuzzyFinder
            bind:value={selectedValue}
            options={options}
            placeholder={localize(config.sheet?.searchJournals)}
            nomatchtext="No journal entries found."
            css="journal-search-input"
            onselect={selectJournal}
         />
         <div class="journal-search-actions">
            <button type="button" onclick={ok} disabled={!selected}>OK</button>
            <button type="button" onclick={cancel}>Cancel</button>
         </div>
      </div>
   </ItemSheetComponent>
</div>
