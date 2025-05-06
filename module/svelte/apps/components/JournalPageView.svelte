<script>
    let { doc, page } = $props();
</script>

<article
    class={`journal-entry-page text page level${page.title?.level || 1}`}
    data-page-id={page._id}
    data-application-part={page._id}>
    <div
        id={`JournalEntryPageProseMirrorSheet-JournalEntry-${doc._id}-JournalEntryPage-${page._id}-view`}>
        <header class="journal-page-header">
            <h1>{page.name}</h1>
        </header>
        <section class="journal-page-content">
            {@html page.text?.content || "<p><em>No content</em></p>"}
        </section>
    </div>
    <div class="edit-container">
        <button
            type="button"
            class="icon fa-solid fa-pen-to-square"
            data-tooltip="JOURNAL.EditPage"
            data-action="editPage"
            aria-label="Edit Page">
        </button>
    </div>
</article>