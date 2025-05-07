<script>
    import { writable } from 'svelte/store';
    import JournalSidebar from "./components/JournalSidebar.svelte";
    import JournalPageView from "./components/JournalPageView.svelte";

    let { doc } = $props();

    let pageIndex = $state(0);

    const pages = writable([]);

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
        pages.update((current) => [...current, ...newPage]);
    };

    const deletePage = async (id) => {
        await doc.deleteEmbeddedDocuments("JournalEntryPage", [id]);
        pages.update((current) => current.filter((page) => page.id !== id));
        if (pageIndex >= $pages.length) {
            pageIndex = Math.max(0, $pages.length - 1);
        }
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
        on:delete={(e) => deletePage(e.detail)} 
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