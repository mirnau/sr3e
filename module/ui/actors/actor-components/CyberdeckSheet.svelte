<script lang="ts">
import { onDestroy } from "svelte";
import { localize } from "../../../services/utilities";
import LabeledBoolean from "../../items/LabeledBoolean.svelte";
import PackeryGrid from "../../common-components/PackeryGrid.svelte";
import SheetCard from "../../common-components/SheetCard.svelte";
import CyberdeckStatsPanel from "./CyberdeckStatsPanel.svelte";
import CyberdeckRollPanel from "./CyberdeckRollPanel.svelte";

const p = $props<{ actor: any; deck: any; onUnjack: () => void }>();

// Foundry mutates the Item document in place on update — the `deck` prop's
// object reference never changes, so a plain read of p.deck.name would
// never re-fire when the deck is renamed on its own item sheet.
let version = $state(0);

function onDeckUpdate(item: any): void {
    if (item.id !== p.deck.id) return;
    version += 1;
}

const updateHookId = Hooks.on("updateItem", onDeckUpdate);
onDestroy(() => Hooks.off("updateItem", updateHookId));

const deckName = $derived.by(() => { void version; return p.deck.name as string; });

function openSheet(): void {
    p.deck.sheet?.render(true);
}

async function onTrashClick(): Promise<void> {
    const confirmed = await (foundry.applications.api.DialogV2 as any).confirm({
        window: { title: localize(CONFIG.SR3E.MODAL.deletecyberdecktitle) },
        content: `<p><strong>${deckName}</strong></p>`,
        yes: { icon: "fa-solid fa-trash-can" },
        defaultYes: false,
    });
    if (!confirmed) return;
    await p.actor.deleteEmbeddedDocuments("Item", [p.deck.id]);
}
</script>

<div class="matrix-cyberdeck-sheet">
    <PackeryGrid gridPrefix="matrix" itemSelector="matrix-packery-grid-item">
        <SheetCard itemClass="matrix-packery-grid-item">
            <div class="matrix-sheet-header">
                <button type="button" class="matrix-sheet-name" onclick={openSheet}>{deckName}</button>
                <button
                    type="button"
                    class="sr3e-toolbar-button fa-solid fa-trash-can"
                    aria-label="Trash"
                    onclick={onTrashClick}
                ></button>
                <LabeledBoolean
                    key="jackedIn"
                    label={localize(CONFIG.SR3E.INVENTORY.garagejackedin)}
                    value={true}
                    onUpdate={(v) => !v && p.onUnjack()}
                />
            </div>
        </SheetCard>

        <SheetCard itemClass="matrix-packery-grid-item">
            <CyberdeckStatsPanel deck={p.deck} />
        </SheetCard>

        <SheetCard itemClass="matrix-packery-grid-item">
            <CyberdeckRollPanel actor={p.actor} deck={p.deck} />
        </SheetCard>
    </PackeryGrid>
</div>
