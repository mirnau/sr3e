<script lang="ts">
import { localize } from "../../../services/utilities";
import { buildCyberdeckStatSetup } from "../../../services/combat/procedures/simpleSetups";
import { openComposer } from "../../../services/combat/procedures/composerService.svelte";

const p = $props<{ actor: any; deck: any }>();
const cyberdeck = $derived(CONFIG.SR3E.CYBERDECK);

const rollableStats = ["bod", "evasion", "sensor", "masking"] as const;

// Always opens the advanced composer — unlike attribute/pool rolls
// elsewhere, these have no simple-roll path; the player picks TN
// modifiers (e.g. Matrix Programs) before confirming every time.
function onStatRoll(statKey: string, title: string): void {
    const setup = buildCyberdeckStatSetup(p.deck, statKey, title);
    openComposer(setup, p.actor);
}
</script>

<div class="matrix-roll-buttons">
    {#each rollableStats as statKey}
        <button type="button" onclick={() => onStatRoll(statKey, localize(cyberdeck[statKey]))}>{localize(cyberdeck[statKey])}</button>
    {/each}
</div>
