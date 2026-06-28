<script lang="ts">
   import JournalSearchModal from "../dialogs/JournalSearchModal.svelte";
   import { mount, unmount, untrack } from "svelte";
   import { openJournalSheet, type JournalOption } from "./journalViewerContent";

   const {
      onJournalContentSelected,
      onJournalContentPreviewed,
      onJournalContentSelectionCancelled,
      config = {},
      id: _id = null,
   }: {
      onJournalContentSelected?: (result: JournalOption) => void;
      onJournalContentPreviewed?: (result: JournalOption) => void;
      onJournalContentSelectionCancelled?: () => void;
      config?: any;
      id?: string | null;
   } = $props();
   const id = untrack(() => _id);

   let journalId = $state(id ?? null);

   function handleOpen() {
      openJournalSheet(journalId);
   }

   function handleSearch() {
      const originalJournalId = journalId;
      const modal = mount(JournalSearchModal, {
         target: document.body,
         props: {
            config,
            onselect: (result: JournalOption) => {
               journalId = result.value;
               onJournalContentPreviewed?.(result);
            },
            onclose: (result: JournalOption | null) => {
               unmount(modal);
               if (result) {
                  journalId = result.value;
                  onJournalContentSelected?.(result);
                  return;
               }

               journalId = originalJournalId;
               onJournalContentSelectionCancelled?.();
            },
         },
      });
   }
</script>

<div
   class="toolbar searchbuttons"
   role="toolbar"
   tabindex="0"
   onclick={(e) => e.stopPropagation()}
   onkeydown={(e) => {
      if (e.key === "Escape") {
         e.currentTarget.blur();
      }
   }}
>
   <button
      class="header-control icon sr3e-toolbar-button"
      aria-label="Open journal entry"
      onclick={handleOpen}
   >
      <i class="fa-solid fa-book-open"></i>
   </button>

   <button
      class="header-control icon sr3e-toolbar-button"
      aria-label="Search journal entries"
      onclick={handleSearch}
   >
      <i class="fa-solid fa-magnifying-glass"></i>
   </button>
</div>
