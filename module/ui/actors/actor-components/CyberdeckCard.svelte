<script lang="ts">
import { onDestroy } from "svelte";
import { localize } from "../../../services/utilities";
import LabeledBoolean from "../../items/LabeledBoolean.svelte";

const p = $props<{ actor: any; deck: any; onJackIn: () => void }>();

// Foundry mutates the Item document in place on update — the `deck` prop's
// object reference never changes, so plain reads of p.deck.name/img would
// never re-fire when the deck is edited on its own item sheet.
let version = $state(0);

function onDeckUpdate(item: any): void {
    if (item.id !== p.deck.id) return;
    version += 1;
}

const updateHookId = Hooks.on("updateItem", onDeckUpdate);
onDestroy(() => Hooks.off("updateItem", updateHookId));

const deckName = $derived.by(() => { void version; return p.deck.name as string; });
const deckImg = $derived.by(() => { void version; return p.deck.img as string; });

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

<!-- svelte-ignore a11y_unknown_aria_attribute -->
<div class="asset-card matrix-deck-card" role="presentation" aria-role="presentation">
    <div class="asset-background-layer"></div>
    <div class="image-mask">
        <img src={deckImg} role="presentation" alt={deckName} />
    </div>

    <div class="asset-card-column">
        <h3 class="no-margin uppercase">{deckName}</h3>
        <div class="asset-card-row">
            <button
                type="button"
                class="sr3e-toolbar-button fa-solid fa-pencil"
                aria-label={localize(CONFIG.SR3E.INVENTORY.matrixopensheet)}
                onclick={openSheet}
            ></button>
            <button
                type="button"
                class="sr3e-toolbar-button fa-solid fa-trash-can"
                aria-label="Trash"
                onclick={onTrashClick}
            ></button>
        </div>
    </div>

    <div class="asset-toggles matrix-jackin-toggle">
        <LabeledBoolean
            key="jackedIn"
            label={localize(CONFIG.SR3E.INVENTORY.garagejackedin)}
            value={false}
            onUpdate={(v) => v && p.onJackIn()}
        />
    </div>
</div>
