<script lang="ts">
    import JournalViewerToolbar from "./JournalViewerToolbar.svelte";

    let { document = {}, config = {} } = $props();

    DEBUG && LOG.inspect("DOCUMENT", [__FILE__, __LINE__], document);

    let toolbar;
    let journalId = $state(document.system.journalId ?? null);
    let previewContent = $state("");

    let journalOptions = $derived(
        () =>
            game.journal?.contents?.map((j) => ({
                label: j.name,
                value: j.id,
            })) ?? [],
    );

    $effect(async () => {
        if (!journalId) {
            previewContent = "";
            return;
        }

        const journal = game.journal.get(journalId);
        const page = journal?.pages?.contents?.[0];

        const content = page?.text?.content || "";
        previewContent = await foundry.applications.ux.TextEditor.enrichHTML(
            content,
            {
                secrets: false,
                documents: false,
            },
        );
    });

    async function handleJournalSelection(result) {
        if (!result) return;

        journalId = result.value;

        await document.update({
            "system.journalId": result.value,
        });
    }
</script>

<div class="item-sheet-component">
    <div class="sr3e-inner-background-container">
        <div class="fake-shadow"></div>
        <div class="sr3e-inner-background">
            <JournalViewerToolbar
                bind:this={toolbar}
                onJournalContentSelected={handleJournalSelection}
                {config}
                id={journalId}
            />

            <div class="preview journal-content">
                {@html previewContent}
            </div>
        </div>
    </div>
</div>
