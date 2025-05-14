<script>
	let { doc } = $props();

	// Reactive state for pages and active index
	let localPages = $state(
		Array.from(doc.pages.values()).sort((a, b) => a.sort - b.sort),
	);
	let activePageIndex = $state(0);
	let viewMode = $state("single"); // 'single' or 'all'

	// Centralized page actions
	async function createPage() {
		try {
			const newPage = await doc.createEmbeddedDocuments(
				"JournalEntryPage",
				[
					{
						_id: foundry.utils.randomID(),
						name: "New Page",
						text: {
							content: "",
							format: CONST.JOURNAL_ENTRY_PAGE_FORMATS.HTML,
						},
						sort: Date.now(),
					},
				],
			);
			localPages = [...localPages, ...newPage].sort(
				(a, b) => a.sort - b.sort,
			);
			activePageIndex = localPages.length - 1;
		} catch (error) {
			console.error("Failed to create page:", error);
		}
	}

	async function deletePage(index) {
		const page = localPages[index];
		if (!page) return;
		try {
			await doc.deleteEmbeddedDocuments("JournalEntryPage", [page._id]);
			localPages = localPages
				.filter((_, i) => i !== index)
				.sort((a, b) => a.sort - b.sort);
			activePageIndex = Math.min(activePageIndex, localPages.length - 1);
		} catch (error) {
			console.error("Failed to delete page:", error);
		}
	}

	function toggleViewMode() {
		viewMode = viewMode === "single" ? "all" : "single";
	}

	function viewModeIcon() {
		return viewMode === "single" ? "fas fa-book-open" : "fas fa-file-alt";
	}

	function goToPage(index) {
		activePageIndex = index;
	}

	function nextPage() {
		activePageIndex = Math.min(localPages.length - 1, activePageIndex + 1);
	}

	function previousPage() {
		activePageIndex = Math.max(0, activePageIndex - 1);
	}

	function handleDragOver(event) {
		event.preventDefault();
		event.dataTransfer.dropEffect = "move";
	}

	let draggedIndex = null;

	function handleDragStart(index) {
		draggedIndex = index;
	}

	function handleDrop(event, dropIndex) {
		event.preventDefault();
		if (draggedIndex === null || draggedIndex === dropIndex) return;

		// Reorder local pages
		const updatedPages = [...localPages];
		const [movedPage] = updatedPages.splice(draggedIndex, 1);
		updatedPages.splice(dropIndex, 0, movedPage);

		// Persist order in the journal
		updatedPages.forEach((page, i) => (page.sort = i));
		localPages = updatedPages.sort((a, b) => a.sort - b.sort);

		// Persist order in Foundry
		doc.updateEmbeddedDocuments(
			"JournalEntryPage",
			updatedPages.map((page, i) => ({ _id: page._id, sort: i })),
		)
			.then(() => {
				console.log("Order updated in Foundry");
			})
			.catch((error) => console.error("Failed to persist order:", error));

		draggedIndex = null;
	}
	let hoveredIndex = $state(null);

	function editPage(index) {
		const page = localPages[index];
		if (!page) return;

		// Trigger the native Foundry editor for the page
		const pageDocument = doc.pages.get(page._id);
		if (pageDocument) {
			pageDocument.sheet.render(true);
		}
	}
</script>

<section class="window-content">
	<aside
		class="sidebar journal-sidebar flexcol"
		data-application-part="sidebar"
	>
		<search>
			<button
				type="button"
				class="inline-control lock-mode icon fa-solid fa-unlock"
				data-action="toggleLock"
				aria-label="Table of contents unlocked. Click to lock."
				data-tooltip=""
			></button>
			<button
				type="button"
				class="inline-control view-mode icon"
				data-action="toggleMode"
				aria-label={viewMode === "single"
					? "Single Page Mode"
					: "All Pages Mode"}
				data-tooltip=""
				on:click={toggleViewMode}
			>
				<i class={viewModeIcon()}></i>
			</button>
			<button
				type="button"
				class="inline-control toggle-search-mode icon fa-solid fa-magnifying-glass"
				data-action="toggleSearch"
				aria-label="Search by Name only"
				data-tooltip=""
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
				data-tooltip=""
			></button>
		</search>

		<nav class="toc" data-tooltip-direction="RIGHT">
			<ol>
				{#each localPages as page, index}
					<li
						class="text level1 page {index === activePageIndex
							? 'active'
							: ''}"
						data-page-id={page._id}
						draggable="true"
						on:click={() => goToPage(index)}
						on:dragstart={() => handleDragStart(index)}
						on:drop={(event) => handleDrop(event, index)}
						on:dragover={handleDragOver}
					>
						<div class="page-heading" data-action="goToHeading">
							<span
								class="page-index"
								data-tooltip-text={page.name}>{index}</span
							>
							<span class="page-title ellipsis">{page.name}</span>
						</div>
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
				on:click={previousPage}
			></button>
			<button
				type="button"
				class="create"
				data-action="createPage"
				on:click={createPage}
			>
				<i class="fas fa-file-circle-plus"></i>
				<span>Add Page</span>
			</button>
			<button
				type="button"
				class="next icon fas fa-chevron-right"
				data-action="nextPage"
				aria-label="Next Page"
				on:click={nextPage}
			></button>
		</footer>
	</aside>

	<section
		class="journal-entry-content flexcol"
		data-application-part="pages"
	>
		<header class="journal-header">
			<input
				class="title"
				name="name"
				type="text"
				bind:value={doc.name}
				placeholder="Entry Title"
				aria-label="Entry Title"
			/>
		</header>

		<div class="journal-entry-pages scrollable editable">
			{#if viewMode === "single"}
				<article class="journal-entry-page text level1 page">
					<header class="journal-page-header">
						<h1>
							{localPages[activePageIndex]?.name || "Untitled Page"}
						</h1>
						<button
							type="button"
							class="edit-button icon fa-solid fa-pen"
							aria-label="Edit Page"
							on:click={() => editPage(activePageIndex)}
						></button>
					</header>
					<section class="journal-page-content">
						{@html localPages[activePageIndex]?.text?.content || "<p><em>No content</em></p>"}
					</section>
				</article>
			{:else}
				{#each localPages as page, index}
					<article class="journal-entry-page text level1 page">
						<header class="journal-page-header">
							<h1>{page.name}</h1>
							<button
								type="button"
								class="edit-button icon fa-solid fa-pen"
								aria-label="Edit Page"
								on:click={() => editPage(index)}
							></button>
						</header>
						<section class="journal-page-content">
							{@html page.text?.content || "<p><em>No content</em></p>"}
						</section>
					</article>
				{/each}
			{/if}
		</div>
		
	</section>
</section>
