<script lang="ts">
import { onMount, untrack } from "svelte";
import { localize } from "../../../services/utilities";
import VehicleConditionMonitor from "./VehicleConditionMonitor.svelte";
import { buildSkillSetup } from "../../../services/combat/procedures/simpleSetups";
import { openComposer } from "../../../services/combat/procedures/composerService.svelte";
import { executeProcedure } from "../../../services/combat/orchestration/executeProcedure";

const p = $props<{ actor: Actor; vehicleUuid: string; onUnlink: (uuid: string) => void }>();
const characterActor = untrack(() => p.actor);

let vehicle = $state<any>(null);
let selectedSkillId = $state<string>("");

const activeSkills = $derived(
    [...((characterActor as any).items ?? [])].filter((item: any) => item.type === "skill" && item.system?.skillType === "active")
);
const vehicleType = $derived(vehicle?.system?.vehicleType ?? "ground");
const handlingTN = $derived(
    vehicleType === "ground"
        ? (vehicle?.system?.handlingRoad?.value ?? vehicle?.system?.handling?.value ?? 4)
        : (vehicle?.system?.handling?.value ?? 4)
);

onMount(async () => {
    vehicle = await fromUuid(p.vehicleUuid) as any;
    if (activeSkills.length > 0) selectedSkillId = activeSkills[0].id;
});

function openSheet() {
    (vehicle as any)?.sheet?.render(true);
}

function updateVehicle(path: string, value: number) {
    vehicle?.update({ [path]: value });
}

function onRoll() {
    if (!vehicle || !selectedSkillId) return;
    const setup = buildSkillSetup(characterActor as any, selectedSkillId, null, vehicle.name, handlingTN);
    const hasTargets = (game.user?.targets?.size ?? 0) > 0;
    if (hasTargets) {
        openComposer(setup, characterActor as never);
    } else {
        void executeProcedure(setup, characterActor as never);
    }
}
</script>

{#if vehicle}
    <div class="garage-vehicle-card">
        <div class="garage-vehicle-header">
            <button type="button" class="garage-vehicle-name" onclick={openSheet}>{vehicle.name}</button>
            <button type="button" aria-label="Unlink" onclick={() => p.onUnlink(p.vehicleUuid)}>
                <i class="fa-solid fa-link-slash"></i>
            </button>
        </div>
        <div class="stat-grid two-column">
            <span>{localize(CONFIG.SR3E.MECHANICAL.handling)}: {handlingTN}</span>
            <span>{localize(CONFIG.SR3E.MECHANICAL.speed)}: {vehicle.system.speed?.value ?? 0}</span>
            <span>{localize(CONFIG.SR3E.MECHANICAL.body)}: {vehicle.system.body?.value ?? 0}</span>
            <span>{localize(CONFIG.SR3E.MECHANICAL.armor)}: {vehicle.system.armor?.value ?? 0}</span>
        </div>
        <VehicleConditionMonitor
            boxesFilled={vehicle.system.condition?.value ?? 0}
            onUpdate={(v) => updateVehicle("system.condition.value", v)}
        />
        {#if activeSkills.length > 0}
            <div class="garage-vehicle-roll">
                <select bind:value={selectedSkillId}>
                    {#each activeSkills as skill}
                        <option value={skill.id}>{skill.name}</option>
                    {/each}
                </select>
                <button type="button" onclick={onRoll}>{localize(CONFIG.SR3E.INVENTORY.garagedrivingroll)}</button>
            </div>
        {/if}
    </div>
{/if}
