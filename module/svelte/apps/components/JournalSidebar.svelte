<script>
    let {
        pages,
        pageIndex,
        isLocked,
        toggleLock,
        toggleViewMode,
        toggleSearchMode,
        toggleSidebar,
        previousPage,
        createPage,
        nextPage,
        setPageIndex
    } = $props();
</script>

<aside class="sidebar journal-sidebar flexcol" data-application-part="sidebar">
    <search>
        <button
            type="button"
            class={`inline-control lock-mode icon fa-solid ${isLocked ? 'fa-lock' : 'fa-unlock'}`}
            data-action="toggleLock"
            aria-label={isLocked
                ? 'Table of contents locked. Click to unlock.'
                : 'Table of contents unlocked. Click to lock.'}
            onclick={toggleLock}>
        </button>
        <button
            type="button"
            class="inline-control view-mode icon fas fa-notes"
            data-action="toggleMode"
            aria-label="Multiple Page Mode"
            onclick={toggleViewMode}>
        </button>
        <button
            type="button"
            class="inline-control toggle-search-mode icon fa-solid fa-magnifying-glass"
            data-action="toggleSearch"
            aria-label="Search by Name only"
            onclick={toggleSearchMode}>
        </button>
        <input
            type="search"
            name="search"
            autocomplete="off"
            placeholder="Search Pages"
            aria-label="Search Pages" />
        <button
            type="button"
            class="inline-control collapse-toggle icon fas fa-caret-right"
            data-action="toggleSidebar"
            aria-label="Collapse Sidebar"
            onclick={toggleSidebar}>
        </button>
    </search>

    <nav class="toc" data-tooltip-direction="RIGHT">
        <ol>
            {#each pages as page, i}
                <li
                    class={`text page level${page.title?.level ?? 1} ${i === pageIndex ? 'active' : ''}`}
                    data-page-id={page.id}
                    draggable="true">
                    <button
                        type="button"
                        class="page-heading"
                        data-action="goToHeading"
                        aria-label={`Go to page ${page.name}`}
                        onclick={() => setPageIndex(i)}>
                        <span class="page-index" data-tooltip-text={page.name}>{i + 1}</span>
                        <span class="page-title ellipsis">{page.name}</span>
                    </button>
                </li>
            {/each}
        </ol>
    </nav>

    <footer class="action-buttons flexrow">
        <button
            type="button"
            class="previous icon fas fa-chevron-left"
            data-action="previousPage"
            aria-label="Previous Page"
            disabled={pageIndex === 0}
            onclick={previousPage}>
        </button>
        <button
            type="button"
            class="create"
            data-action="createPage"
            onclick={createPage}>
            <i class="fas fa-file-circle-plus" inert></i>
            <span>Add Page</span>
        </button>
        <button
            type="button"
            class="next icon fas fa-chevron-right"
            data-action="nextPage"
            aria-label="Next Page"
            disabled={pageIndex === pages.length - 1}
            onclick={nextPage}>
        </button>
    </footer>
</aside>
