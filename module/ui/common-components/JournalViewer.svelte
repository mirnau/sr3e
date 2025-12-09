<script lang="ts">
	import JournalViewerToolbar from "./JournalViewerToolbar.svelte";
	import ItemSheetComponent from "./ItemSheetComponent.svelte";

	type JournalOption = {
		value: string;
		type: "entry" | "page";
		label: string;
	};

	let {
		document,
		config = {},
	}: {
		document: Actor | Item;
		config?: any;
	} = $props();

	let toolbar: any;
	let journalId = $state((document.system as any).journalId ?? null);
	let previewContent = $state("");

	$effect(() => {
		if (!journalId) {
			previewContent = "";
			return;
		}

		const journal = game.journal.get(journalId);
		const page = journal?.pages?.contents?.[0];

		const content = page?.text?.content || "";

		// Call async function inside effect without making effect async
		// @ts-ignore - enrichHTML exists but type definitions are incomplete
		(foundry.applications.ux.TextEditor.enrichHTML(content, {
			secrets: false,
			documents: false,
		}) as Promise<string>).then((enriched) => {
			previewContent = enriched;
		});
	});

	async function handleJournalSelection(result: JournalOption) {
		if (!result) return;

		journalId = result.value;

		await document.update({
			"system.journalId": result.value,
		});
	}
</script>

<ItemSheetComponent>
	<JournalViewerToolbar
		bind:this={toolbar}
		onJournalContentSelected={handleJournalSelection}
		{config}
		id={journalId}
	/>

	<div class="preview journal-content">
		{@html previewContent}
	</div>
</ItemSheetComponent>
