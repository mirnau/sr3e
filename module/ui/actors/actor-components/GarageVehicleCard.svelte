<script lang="ts">
import { onMount, untrack } from "svelte";
import { localize } from "../../../services/utilities";
import LabeledBoolean from "../../items/LabeledBoolean.svelte";

type GarageEntry = { uuid: string; seated: boolean; vcrId: string; jackedIn: boolean };

const p = $props<{ actor: Actor; entry: GarageEntry; onUnlink: (uuid: string) => void; onSeat: () => void }>();
const vehicleUuid = untrack(() => p.entry.uuid);

let vehicle = $state<any>(null);

onMount(async () => {
    vehicle = await fromUuid(vehicleUuid) as any;
});

function openSheet() {
    (vehicle as any)?.sheet?.render(true);
}
</script>

{#if vehicle}
    <!-- svelte-ignore a11y_unknown_aria_attribute -->
    <div class="asset-card garage-vehicle-card" role="presentation" aria-role="presentation">
        <div class="asset-background-layer"></div>
        <div class="image-mask">
            <img src={vehicle.img} role="presentation" alt={vehicle.name} />
        </div>

        <div class="asset-card-column">
            <div class="asset-card-row">
                <div class="asset-card-column">
                    <h3 class="no-margin uppercase">{vehicle.name}</h3>
                </div>
            </div>

            <div class="asset-card-row">
                <button
                    type="button"
                    class="sr3e-toolbar-button fa-solid fa-pencil"
                    aria-label="Edit"
                    onclick={openSheet}
                ></button>
                <button
                    type="button"
                    class="sr3e-toolbar-button fa-solid fa-trash-can"
                    aria-label="Unlink"
                    onclick={() => p.onUnlink(vehicleUuid)}
                ></button>
            </div>
        </div>

        <div class="asset-toggles garage-seated-toggle">
            <LabeledBoolean
                key="seated"
                label={localize(CONFIG.SR3E.INVENTORY.garageseated)}
                value={false}
                onUpdate={(v) => v && p.onSeat()}
            />
        </div>
    </div>
{/if}
