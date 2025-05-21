<script>
    // @runes
    import MyModal from "../../apps/dialogs/JournalSearchModal.svelte";
    import JournalSearchModal from "../../apps/dialogs/JournalSearchModal.svelte";
    import { mount, unmount } from "svelte";

    const { onJournalContentSelected, config = {}, id={} } = $props();
    let journalId = $state(id ?? null);
    let showModal = $state(false);

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
                onclose: (result) => {
                    unmount(modal);
                    if (result) {
                        console.log("User clicked OK", { result });
                        journalId = result.value;
                        onJournalContentSelected?.(result);
                    } else {
                        console.log("User clicked Cancel");
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
