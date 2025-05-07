<script>
    import { createEventDispatcher } from 'svelte';

    /**
     * Incoming props from parent (Foundry VTT Application)
     * All functions are opaque; we just call them and let the parent mutate data
     * We keep local reactive mirrors so the UI reacts instantly even before the
     * parent re‑renders the component tree.
     */
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
        setPageIndex,
    } = $props();

    const dispatch = createEventDispatcher();

    /** Sidebar element ref */
    let sidebarEl = $state(null);

    /**
     * Local mirrors to keep the DOM reactive when the parent mutates data.
     */
    let localPages = $state([]);
    let idx = $state(pageIndex);

    /**
     * Sync mirrors whenever the parent updates the props.
     */
    $effect(() => {
        // Ensure the local copy updates on external page mutations
        localPages = [...pages];
        idx = pageIndex;
    });

    /**
     * Re‑order helper for drag‑and‑drop
     */
    const updateOrder = (from, to) => {
        const updated = [...localPages];
        const [moved] = updated.splice(from, 1);
        updated.splice(to, 0, moved);
        localPages = updated;
        dispatch('reorder', { pages: updated });
    };

    /** Drag‑and‑drop state */
    let dragSrc = -1;

    const handleDragStart = (e, i) => {
        dragSrc = i;
        e.dataTransfer.effectAllowed = 'move';
    };
    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };
    const handleDrop = (e, i) => {
        e.preventDefault();
        if (dragSrc === -1 || dragSrc === i) return;
        updateOrder(dragSrc, i);
        dragSrc = -1;
    };

    /** Context‑menu (duplicate / delete) */
    const duplicatePage = (id) => console.log(`Duplicating ${id}`);
    const deletePage = (id) => console.log(`Deleting ${id}`);

    const menuItems = [
        {
            name: 'Duplicate Page',
            icon: '<i class="fas fa-copy"></i>',
            callback: (li) => duplicatePage(li.dataset.pageId),
        },
        {
            name: 'Delete Page',
            icon: '<i class="fas fa-trash"></i>',
            callback: (li) => deletePage(li.dataset.pageId),
        },
    ];

    $effect(() => {
        if (!sidebarEl) return;
        const legacy13 = game?.release?.generation === 13 || game?.version?.startsWith('13.');
        const opts = legacy13 ? { jQuery: false } : {};
        const ctx = new foundry.applications.ux.ContextMenu(sidebarEl, 'li.page', menuItems, opts);
        return () => ctx.close();
    });

    /**
     * Local wrappers around navigation buttons so the disabled state updates
     * immediately, without waiting for the parent re‑render.
     */
    const handlePrevious = () => {
        if (idx === 0) return;
        previousPage?.();
        idx -= 1;
    };
    const handleNext = () => {
        if (idx === localPages.length - 1) return;
        nextPage?.();
        idx += 1;
    };
    const handleCreate = async () => {
        await createPage?.();
        localPages = [...pages];  // Force a sync after creating a page
        idx = localPages.length - 1;
    };
</script>

<aside
    bind:this={sidebarEl}
    class="sidebar journal-sidebar flexcol"
    data-application-part="sidebar"
>
    <search>
        <button
            type="button"
            class={`inline-control lock-mode icon fa-solid ${isLocked ? 'fa-lock' : 'fa-unlock'}`}
            data-action="toggleLock"
            aria-label={isLocked ? 'Table of contents locked. Click to unlock.' : 'Table of contents unlocked. Click to lock.'}
            onclick={toggleLock}
        ></button>

        <button
            type="button"
            class="inline-control view-mode icon fas fa-notes"
            data-action="toggleMode"
            aria-label="Multiple Page Mode"
            onclick={toggleViewMode}
        ></button>

        <button
            type="button"
            class="inline-control toggle-search-mode icon fa-solid fa-magnifying-glass"
            data-action="toggleSearch"
            aria-label="Search by Name only"
            onclick={toggleSearchMode}
        ></button>

        <input
            type="search"
            name="search"
            autocomplete="off"
            placeholder="Search Pages"
            aria-label="Search Pages"
        />

        <button
            type="button"
            class="inline-control collapse-toggle icon fas fa-caret-right"
            data-action="toggleSidebar"
            aria-label="Collapse Sidebar"
            onclick={toggleSidebar}
        ></button>
    </search>

    <nav class="toc" data-tooltip-direction="RIGHT">
        <ol>
            {#each localPages as page, i (page.id)}
                <li
                    class={`text page level${page.title?.level ?? 1} ${i === idx ? 'active' : ''}`}
                    data-page-id={page.id}
                    draggable="true"
                    ondragstart={(e) => handleDragStart(e, i)}
                    ondragover={handleDragOver}
                    ondrop={(e) => handleDrop(e, i)}
                >
                    <button
                        type="button"
                        class="page-heading"
                        data-action="goToHeading"
                        aria-label={`Go to page ${page.name}`}
                        onclick={() => setPageIndex(i)}
                    >
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
            aria-label="Previous Page"
            disabled={idx === 0}
            onclick={handlePrevious}
        ></button>

        <button
            type="button"
            class="create"
            aria-label="Add Page"
            onclick={handleCreate}
        >
            <i class="fas fa-file-circle-plus" inert></i>
            <span>Add Page</span>
        </button>

        <button
            type="button"
            class="next icon fas fa-chevron-right"
            aria-label="Next Page"
            disabled={idx === localPages.length - 1}
            onclick={handleNext}
        ></button>
    </footer>
</aside>