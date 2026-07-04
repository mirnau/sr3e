<script lang="ts">
import { localize } from "../../../services/utilities";
import { KarmaDistributionService } from "../../../services/karma/KarmaDistributionService";
import PoolRow, { type PoolRowApi } from "./PoolRow.svelte";

let delimiter = $state("");
const rowRefs = new Map<string, PoolRowApi>();
let anyReady = $state(false);

const allActors = KarmaDistributionService.Instance().getCharacterActors();

const filteredActors = $derived(
    delimiter.length > 0
        ? allActors.filter((a: Actor) => a.name!.toLowerCase().includes(delimiter.toLowerCase()))
        : allActors
);

function updateReadyState() {
    anyReady = Array.from(rowRefs.values()).some(row => row.readyForCommit);
}

async function commitSelected() {
    for (const a of filteredActors) {
        await rowRefs.get(a.id!)?.CommitSelected();
    }
}

function selectAll() {
    filteredActors.forEach((a: Actor) => rowRefs.get(a.id!)?.SelectAll());
}

function deselectAll() {
    filteredActors.forEach((a: Actor) => rowRefs.get(a.id!)?.DeselectAll());
}
</script>

<div class="pool-manager">
    <div class="pool-manager__toolbar">
        <div class="karma-input-frame pool-manager__search">
            <input type="text" bind:value={delimiter} placeholder="Search characters..." />
        </div>
        <button type="button" onclick={selectAll}>Select All</button>
        <button type="button" onclick={deselectAll}>Deselect All</button>
        <button type="button" onclick={commitSelected} disabled={!anyReady}>
            Refresh Selected
        </button>
    </div>

    {#if filteredActors.length > 0}
        <table class="pool-manager__table">
            <thead>
                <tr>
                    <th>Portrait</th>
                    <th>Name</th>
                    <th>{localize(CONFIG.SR3E.DICE_POOLS.combat)}</th>
                    <th>{localize(CONFIG.SR3E.DICE_POOLS.astral)}</th>
                    <th>{localize(CONFIG.SR3E.DICE_POOLS.hacking)}</th>
                    <th>{localize(CONFIG.SR3E.DICE_POOLS.control)}</th>
                    <th>{localize(CONFIG.SR3E.DICE_POOLS.spell)}</th>
                </tr>
            </thead>
            <tbody>
                {#each filteredActors as a (a.id)}
                    <PoolRow
                        actor={a}
                        onCommitStatusChange={updateReadyState}
                        onmount={(api) => rowRefs.set(a.id!, api)}
                    />
                {/each}
            </tbody>
        </table>
    {:else}
        <p>No characters found.</p>
    {/if}
</div>
