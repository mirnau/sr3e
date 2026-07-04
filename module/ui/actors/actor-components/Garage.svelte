<script lang="ts">
import { onDestroy, untrack } from "svelte";
import { localize } from "../../../services/utilities";
import type { IStoreManager } from "../../../utilities/IStoreManager";
import { StoreManager } from "../../../utilities/StoreManager.svelte";
import GarageVehicleCard from "./GarageVehicleCard.svelte";
import GarageVehicleSheet from "./GarageVehicleSheet.svelte";

type GarageEntry = { uuid: string; seated: boolean; vcrId: string; jackedIn: boolean };

const p = $props<{ actor: Actor }>();
const actor = untrack(() => p.actor);
const storeManager: IStoreManager = StoreManager.Instance as IStoreManager;
storeManager.Subscribe(actor);

const garageStore = storeManager.GetRWStore<GarageEntry[]>(actor, "garage");
let dragHover = $state(false);

const seatedEntry = $derived($garageStore.find((entry) => entry.seated) ?? null);

onDestroy(() => storeManager.Unsubscribe(actor));

async function handleDrop(e: DragEvent) {
    e.preventDefault();
    dragHover = false;
    const raw = e.dataTransfer?.getData("text/plain");
    if (!raw) return;
    const data = JSON.parse(raw);
    const dropped = await fromUuid(data.uuid) as any;
    if (!(dropped instanceof Actor) || dropped.type !== "mechanical") {
        ui.notifications?.warn(localize(CONFIG.SR3E.INVENTORY.garagewrongtype));
        return;
    }
    if ($garageStore.some((entry) => entry.uuid === dropped.uuid)) return;
    garageStore.set([...$garageStore, { uuid: dropped.uuid, seated: false, vcrId: "", jackedIn: false }]);
}

function unlink(uuid: string) {
    garageStore.set($garageStore.filter((entry) => entry.uuid !== uuid));
}

function setSeated(uuid: string, seated: boolean) {
    // Unseating always jacks out too — being jacked into a vehicle you've
    // just climbed out of isn't a valid state.
    garageStore.set($garageStore.map((entry) => (
        entry.uuid === uuid
            ? { ...entry, seated, jackedIn: seated ? entry.jackedIn : false }
            : { ...entry, seated: false, jackedIn: false }
    )));
}

function updateEntry(uuid: string, changes: Partial<GarageEntry>) {
    garageStore.set($garageStore.map((entry) => (entry.uuid === uuid ? { ...entry, ...changes } : entry)));
}
</script>

{#if seatedEntry}
    <GarageVehicleSheet
        {actor}
        entry={seatedEntry}
        onUpdate={(changes) => updateEntry(seatedEntry.uuid, changes)}
        onUnseat={() => setSeated(seatedEntry.uuid, false)}
    />
{:else}
    <div
        class="asset-category-container static-full-width garage-dropzone{dragHover ? ' drag-hover' : ''}"
        role="region"
        aria-label={localize(CONFIG.SR3E.INVENTORY.garage)}
        ondragover={(e) => { e.preventDefault(); dragHover = true; }}
        ondragleave={() => (dragHover = false)}
        ondrop={handleDrop}
    >
        <div class="asset-masonry-background-layer"></div>
        {#if $garageStore.length === 0}
            <p class="no-margin">{localize(CONFIG.SR3E.INVENTORY.garageempty)}</p>
        {:else}
            <div class="asset-masonry-grid garage-masonry-grid">
                {#each $garageStore as entry (entry.uuid)}
                    <div class="asset-card-container">
                        <GarageVehicleCard {actor} {entry} onUnlink={unlink} onSeat={() => setSeated(entry.uuid, true)} />
                    </div>
                {/each}
            </div>
        {/if}
    </div>
{/if}
