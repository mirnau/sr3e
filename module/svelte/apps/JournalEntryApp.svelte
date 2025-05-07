<script>
    import { writable } from 'svelte/store';
    import JournalSidebar from "./components/JournalSidebar.svelte";
    import JournalPageView from "./components/JournalPageView.svelte";

    let { doc } = $props();

    let pageIndex = $state(0);

    // Use a writable store for pages
    const pages = writable([]);

    // Initialize the pages store with sorted pages
    $effect(() => {
        const list = doc.pages?.contents ?? [];
        pages.set([...list].sort((a, b) => a.sort - b.sort));
    });

    let isLocked = $state(true);
    const toggleLock = () => (isLocked = !isLocked);

    let viewMode = $state(false);
    const toggleViewMode = () => (viewMode = !viewMode);

    const toggleSearchMode = () => {
        // Implement search mode toggle if needed
    };

    const toggleSidebar = () => {
        // Implement sidebar toggle if needed
    };

    const previousPage = () => {
        pageIndex = Math.max(0, pageIndex - 1);
    };

    const nextPage = () => {
        pageIndex = Math.min($pages.length - 1, pageIndex + 1);
    };

    const setPageIndex = (i) => {
        pageIndex = i;
    };

    const createPage = async () => {
        const newPage = await doc.createEmbeddedDocuments("JournalEntryPage", [
            {
                name: `Page ${$pages.length + 1}`,
                type: "text",
                text: {
                    content: "",
                    format: CONST.JOURNAL_ENTRY_PAGE_FORMATS.HTML,
                },
            },
        ]);
        // Update the pages store with the new page
        pages.update((current) => [...current, ...newPage]);
    };
</script>

<section class="window-content">
    <JournalSidebar
        pages={$pages}
        {pageIndex}
        {isLocked}
        {toggleLock}
        {toggleViewMode}
        {toggleSearchMode}
        {toggleSidebar}
        {previousPage}
        {createPage}
        {nextPage}
        {setPageIndex}
    />

    <section class="journal-entry-content flexcol" data-application-part="pages">
        <header class="journal-header">
            <input
                class="title"
                name="name"
                type="text"
                value={doc.name}
                placeholder="Entry Title"
                aria-label="Entry Title"
            />
        </header>

        <div class="journal-entry-pages scrollable editable">
            {#if $pages.length > 0}
                {#if viewMode}
                    {#each $pages as page}
                        <JournalPageView {doc} {page} />
                    {/each}
                {:else}
                    <JournalPageView {doc} page={$pages[pageIndex]} />
                {/if}
            {/if}
        </div>
    </section>
</section>
