<script lang="ts">
	import JournalSearchModal from "../dialogs/JournalSearchModal.svelte";
	import { mount, unmount } from "svelte";

	type JournalOption = {
		value: string;
		type: "entry" | "page";
		label: string;
	};

	const {
		onJournalContentSelected,
		config = {},
		id = null,
	}: {
		onJournalContentSelected?: (result: JournalOption) => void;
		config?: any;
		id?: string | null;
	} = $props();

	let journalId = $state(id ?? null);

	function handleOpen() {
		if (!journalId) return;
		const entry = game.journal.get(journalId);
		entry?.sheet?.render(true);
	}

	function handleSearch() {
		const modal = mount(JournalSearchModal, {
			target: document.body,
			props: {
				config,
				onclose: (result: JournalOption | null) => {
					unmount(modal);
					if (result) {
						journalId = result.value;
						onJournalContentSelected?.(result);
					}
				},
			},
		});
	}
</script>

<div
	class="toolbar searchbuttons"
	role="toolbar"
	tabindex="0"
	onclick={(e) => e.stopPropagation()}
	onkeydown={(e) => {
		if (e.key === "Escape") {
			e.currentTarget.blur();
		}
	}}
>
	<button
		class="header-control icon sr3e-toolbar-button"
		aria-label="Open journal entry"
		onclick={handleOpen}
	>
		<i class="fa-solid fa-book-open"></i>
	</button>

	<button
		class="header-control icon sr3e-toolbar-button"
		aria-label="Search journal entries"
		onclick={handleSearch}
	>
		<i class="fa-solid fa-magnifying-glass"></i>
	</button>
</div>
