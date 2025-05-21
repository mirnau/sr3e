<script>
    import JournalViewerToolbar from "./JournalViewerToolbar.svelte";

    let { item = {}, config = {} } = $props();

    let toolbar;
    let journalId = $state(item.system.journalId ?? null);
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
                async: true,
                secrets: false,
                documents: true,
            },
        );
    });

    async function handleJournalSelection(result) {
        if (!result) return;

        journalId = result.value;

        await item.update({
            "system.journalId": result.value,
        });
    }
</script>

<JournalViewerToolbar
    bind:this={toolbar}
    onJournalContentSelected={handleJournalSelection}
    {config}
    id={journalId}
/>

<div class="preview journal-content">
    {@html previewContent}
</div>
