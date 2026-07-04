<script lang="ts">
import { onDestroy, untrack } from "svelte";
import { localize } from "../../../services/utilities";
import type { IStoreManager } from "../../../utilities/IStoreManager";
import { StoreManager } from "../../../utilities/StoreManager.svelte";
import GarageVehicleCard from "./GarageVehicleCard.svelte";

const p = $props<{ actor: Actor }>();
const actor = untrack(() => p.actor);
const storeManager: IStoreManager = StoreManager.Instance as IStoreManager;
storeManager.Subscribe(actor);

const garageStore = storeManager.GetRWStore<string[]>(actor, "garage");
let dragHover = $state(false);

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
    if ($garageStore.includes(dropped.uuid)) return;
    garageStore.set([...$garageStore, dropped.uuid]);
}

function unlink(uuid: string) {
    garageStore.set($garageStore.filter((linked) => linked !== uuid));
}
</script>

<div
    class="garage-dropzone{dragHover ? ' drag-hover' : ''}"
    role="region"
    aria-label={localize(CONFIG.SR3E.INVENTORY.garage)}
    ondragover={(e) => { e.preventDefault(); dragHover = true; }}
    ondragleave={() => (dragHover = false)}
    ondrop={handleDrop}
>
    {#if $garageStore.length === 0}
        <p class="no-margin">{localize(CONFIG.SR3E.INVENTORY.garageempty)}</p>
    {:else}
        <div class="garage-list">
            {#each $garageStore as uuid (uuid)}
                <GarageVehicleCard {actor} vehicleUuid={uuid} onUnlink={unlink} />
            {/each}
        </div>
    {/if}
</div>
