<script>
	let { item = {} } = $props();

	let journalId = $state(item.system.journalReference?.journalId ?? null);
	let previewContent = $state("");
	let filter = $state("");
	let showDropdown = $state(false);

	let journalOptions = $derived(() =>
		game.journal?.contents?.map(j => ({
			label: j.name,
			value: j.id
		})) ?? []
	);

	let filteredOptions = $derived(() =>
		journalOptions().filter(j =>
			j.label.toLowerCase().includes(filter.trim().toLowerCase())
		)
	);

	$effect(() => {
		if (!journalId) {
			previewContent = "";
			return;
		}

		const journal = game.journal.get(journalId);
		if (!journal) {
			previewContent = "[Linked journal not found]";
			return;
		}

		const page = journal.pages.contents[0];
		if (!page) {
			previewContent = "[No pages found in the journal]";
			return;
		}

		const content = page.text?.content || "";
		const snippet = content.replace(/<[^>]+>/g, "").slice(0, 300);
		previewContent = snippet + (content.length > 300 ? "..." : "");
	});

	async function selectJournal(option) {
		journalId = option.value;
		filter = option.label;
		showDropdown = false;
		await item.update({ "system.journalReference.journalId": option.value });
	}

	function openJournal() {
		const journal = game.journal.get(journalId);
		if (journal) journal.sheet.render(true);
	}
</script>

<div class="journal-viewer">
	<div class="journal-search-bar">
		<div class="dropdown-wrapper">
			<input
				type="search"
				class="dropdown-input"
				bind:value={filter}
				oninput={() => showDropdown = true}
				onfocus={() => showDropdown = true}
				onblur={() => setTimeout(() => showDropdown = false, 150)}
				placeholder="Search Journals"
				autocomplete="off"
			/>

			{#if showDropdown}
				<ul class="dropdown-list">
					{#if filteredOptions().length > 0}
						{#each filteredOptions() as option (option.value)}
							<li class="dropdown-item" onclick={() => selectJournal(option)}>
								<i class="fa-solid fa-book-open" style="margin-right: 0.5rem;"></i>
								{option.label}
							</li>
						{/each}
					{:else}
						<li class="dropdown-empty">No journal entries found.</li>
					{/if}
				</ul>
			{/if}
		</div>
	</div>

	{#if journalId}
		<div class="journal-toolbar">
			<strong>Linked:</strong> {game.journal.get(journalId)?.name}
			<button onclick={openJournal} class="open-journal-button">
				<i class="fa-solid fa-up-right-from-square"></i> Open
			</button>
		</div>

		<div class="journal-preview">
			{@html previewContent}
		</div>
	{/if}
</div>
