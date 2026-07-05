<script lang="ts">
import { onDestroy } from "svelte";
import { localize } from "../../../services/utilities";
import { computeDetectionFactor, numberValue } from "../../items/cyberdeckCalculations";

const p = $props<{ deck: any }>();
const cyberdeck = $derived(CONFIG.SR3E.CYBERDECK);

// Foundry mutates the Item document in place on update — the `deck` prop's
// object reference never changes, so a $derived reading p.deck.system
// directly would never re-fire when the deck is edited on its own item
// sheet. Bumping this on the item's own updateItem hook forces the
// recompute, same pattern as MatrixProgramCard.svelte/GarageVehicleSheet.svelte.
let version = $state(0);

function onDeckUpdate(item: any): void {
    if (item.id !== p.deck.id) return;
    version += 1;
}

const updateHookId = Hooks.on("updateItem", onDeckUpdate);
onDestroy(() => Hooks.off("updateItem", updateHookId));

const system = $derived.by(() => { void version; return p.deck.system as Record<string, any>; });

const mpcp = $derived(numberValue(system.mpcp));
const detectionFactor = $derived(computeDetectionFactor(system.persona?.masking, system.sleazeRating, mpcp));
</script>

<div class="stat-grid two-column">
    <p class="no-margin">{localize(cyberdeck.mpcp)}: {mpcp}</p>
    <p class="no-margin">{localize(cyberdeck.detectionFactor)}: {detectionFactor}</p>
    <p class="no-margin">{localize(cyberdeck.activeMemory)}: {system.memory?.active?.max ?? 0} Mp</p>
    <p class="no-margin">{localize(cyberdeck.storageMemory)}: {system.memory?.storage?.max ?? 0} Mp</p>
    <p class="no-margin">{localize(cyberdeck.masking)}: {system.persona?.masking ?? 0}</p>
    <p class="no-margin">{localize(cyberdeck.hardening)}: {system.stats?.hardening ?? 0}</p>
</div>
