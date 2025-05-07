<script>
    import { onMount } from 'svelte';
    import { createEventDispatcher } from 'svelte';
    import { writable, derived } from 'svelte/store';

    export let doc;
    const dispatch = createEventDispatcher();

    // Store for pages
    const pages = writable([]);
    const activePageIndex = writable(0);

    // Load pages on mount, ensuring they are sorted correctly
    onMount(() => {
        const initialPages = doc.pages?.contents.map(p => p.toObject()).sort((a, b) => a.sort - b.sort) || [];
        pages.set(initialPages);
    });

    // Derived store for active page
    const activePage = derived([pages, activePageIndex], ([$pages, $activePageIndex]) => $pages[$activePageIndex] || {});

    function goToPage(index) {
        activePageIndex.set(index);
        dispatch('navigate', { index });
    }

    function createPage() {
        const newPage = { _id: Date.now().toString(), name: 'New Page', text: { content: '', format: 'HTML' }, sort: Date.now() };
        pages.update(p => {
            const updatedPages = [...p, newPage];
            doc.createEmbeddedDocuments('JournalEntryPage', [newPage]);
            return updatedPages;
        });
        activePageIndex.set(pages.length - 1);
        dispatch('create', { page: newPage });
    }

    function movePage(fromIndex, toIndex) {
        pages.update(p => {
            const updated = [...p];
            const [moved] = updated.splice(fromIndex, 1);
            updated.splice(toIndex, 0, moved);

            // Update sort order based on new index positions
            updated.forEach((page, idx) => (page.sort = idx * 1000));

            // Persist the sort order to the Foundry VTT document
            doc.updateEmbeddedDocuments('JournalEntryPage', updated.map(p => ({ _id: p._id, sort: p.sort })));
            return updated;
        });
    }

    function previousPage() {
        activePageIndex.update(index => Math.max(0, index - 1));
    }

    function nextPage() {
        pages.subscribe($pages => {
            activePageIndex.update(index => Math.min($pages.length - 1, index + 1));
        });
    }

    let dragSrcIndex = -1;

    function handleDragStart(index) {
        dragSrcIndex = index;
    }

    function handleDrop(event, index) {
        event.preventDefault();
        if (dragSrcIndex !== -1 && dragSrcIndex !== index) {
            movePage(dragSrcIndex, index);
            dragSrcIndex = -1;
        }
    }

    function handleDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }
</script>

<section class="window-content">
    <aside class="sidebar journal-sidebar flexcol" data-application-part="sidebar">
        <search>
            <button type="button" class="inline-control lock-mode icon fa-solid fa-unlock" data-action="toggleLock"></button>
            <button type="button" class="inline-control view-mode icon fas fa-note" data-action="toggleMode"></button>
            <button type="button" class="inline-control toggle-search-mode icon fa-solid fa-magnifying-glass" data-action="toggleSearch"></button>
            <input type="search" placeholder="Search Pages" />
            <button type="button" class="inline-control collapse-toggle icon fas fa-caret-right" data-action="toggleSidebar"></button>
        </search>

        <nav class="toc" data-tooltip-direction="RIGHT">
            <ol>
                {#each $pages as page, index}
                    <li class="text level1 page" class:active={index === $activePageIndex} draggable="true" 
                        on:dragstart={() => handleDragStart(index)} 
                        on:drop={(event) => handleDrop(event, index)}
                        on:dragover={handleDragOver}
                        on:click={() => goToPage(index)}>
                        <div class="page-heading" data-action="goToHeading">
                            <span class="page-index">{index}</span>
                            <span class="page-title ellipsis">{page.name}</span>
                        </div>
                    </li>
                {/each}
            </ol>
        </nav>

        <footer class="action-buttons flexrow">
            <button type="button" class="previous icon fas fa-chevron-left" data-action="previousPage" on:click={previousPage}></button>
            <button type="button" class="create" data-action="createPage" on:click={createPage}>
                <i class="fas fa-file-circle-plus"></i>
                <span>Add Page</span>
            </button>
            <button type="button" class="next icon fas fa-chevron-right" data-action="nextPage" on:click={nextPage}></button>
        </footer>
    </aside>

    <section class="journal-entry-content flexcol" data-application-part="pages">
        <header class="journal-header">
            <input class="title" name="name" type="text" bind:value={doc.name} placeholder="Entry Title" />
        </header>

        <div class="journal-entry-pages scrollable editable">
            <article class="journal-entry-page text level1 page">
                <header class="journal-page-header">
                    <h1>{$activePage.name}</h1>
                </header>
                <section class="journal-page-content">
                    {@html $activePage.text?.content || '<p><em>No content</em></p>'}
                </section>
            </article>
        </div>
    </section>
</section>