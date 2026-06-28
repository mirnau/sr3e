<script lang="ts">
   import { untrack } from "svelte";
   import JournalViewerToolbar from "./JournalViewerToolbar.svelte";
   import ItemSheetComponent from "./ItemSheetComponent.svelte";
   import { enrichJournalContent, type JournalOption } from "./journalViewerContent";

   let {
      document: _document,
      config = {},
   }: {
      document: Actor | Item;
      config?: any;
   } = $props();
   const document = untrack(() => _document);
   const initialJournalId = (document.system as any).journalId ?? null;

   let toolbar: any;
   let savedJournalId = $state<string | null>(initialJournalId);
   let previewJournalId = $state<string | null>(initialJournalId);
   let previewContent = $state("");

   $effect(() => {
      if (!previewJournalId) {
         previewContent = "";
         return;
      }

      const targetId = previewJournalId;
      enrichJournalContent(targetId).then((enriched) => {
         if (previewJournalId === targetId) previewContent = enriched;
      });
   });

   function handleJournalPreview(result: JournalOption) {
      previewJournalId = result.value;
   }

   function handleJournalSelectionCancelled() {
      previewJournalId = savedJournalId;
   }

   async function handleJournalSelection(result: JournalOption) {
      if (!result) return;

      savedJournalId = result.value;
      previewJournalId = result.value;

      await document.update({
         "system.journalId": result.value,
      });
   }
</script>

<ItemSheetComponent>
   <JournalViewerToolbar
      bind:this={toolbar}
      onJournalContentPreviewed={handleJournalPreview}
      onJournalContentSelected={handleJournalSelection}
      onJournalContentSelectionCancelled={handleJournalSelectionCancelled}
      {config}
      id={previewJournalId}
   />

   <div class="preview journal-content">
      {@html previewContent}
   </div>
</ItemSheetComponent>
