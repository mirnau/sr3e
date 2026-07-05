<script lang="ts">
import { localize } from "../../../services/utilities";
import CyberdeckCard from "./CyberdeckCard.svelte";
import CyberdeckSheet from "./CyberdeckSheet.svelte";
import MatrixProgramCard from "./MatrixProgramCard.svelte";

const p = $props<{ actor: Actor; cyberdecks: Item[]; programs: Item[] }>();

const jackedInDeck = $derived(p.cyberdecks.find((deck: any) => deck.system?.jackedIn) ?? null);

async function setJackedIn(deckId: string, jackedIn: boolean): Promise<void> {
    const updates = p.cyberdecks.map((deck: any) => ({
        _id: deck.id,
        "system.jackedIn": deck.id === deckId ? jackedIn : false,
    }));
    await (p.actor as any).updateEmbeddedDocuments("Item", updates, { render: false });
}
</script>

{#if p.programs.length > 0}
    <div class="asset-category-container static-full-width matrix-programs-container">
        <div class="asset-masonry-background-layer"></div>
        <div class="matrix-program-list">
            {#each p.programs as program (program.id)}
                <MatrixProgramCard actor={p.actor} {program} />
            {/each}
        </div>
    </div>
{/if}

{#if jackedInDeck}
    <CyberdeckSheet actor={p.actor} deck={jackedInDeck} onUnjack={() => setJackedIn((jackedInDeck as any).id, false)} />
{:else}
    <div class="asset-category-container static-full-width matrix-container">
        <div class="asset-masonry-background-layer"></div>
        {#if p.cyberdecks.length === 0}
            <p class="no-margin">{localize(CONFIG.SR3E.INVENTORY.matrixempty)}</p>
        {:else}
            <div class="asset-masonry-grid matrix-masonry-grid">
                {#each p.cyberdecks as deck (deck.id)}
                    <div class="asset-card-container">
                        <CyberdeckCard actor={p.actor} {deck} onJackIn={() => setJackedIn(deck.id, true)} />
                    </div>
                {/each}
            </div>
        {/if}
    </div>
{/if}
