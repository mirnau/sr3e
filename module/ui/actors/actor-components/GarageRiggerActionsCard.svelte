<script lang="ts">
import { onDestroy, onMount, untrack } from "svelte";
import { localize } from "../../../services/utilities";
import type { IStoreManager } from "../../../utilities/IStoreManager";
import { StoreManager } from "../../../utilities/StoreManager.svelte";
import LabeledDropdown from "../../items/LabeledDropdown.svelte";
import {
    buildVehicleDrivingTestSetup,
    buildVehicleOpenTestSetup,
    buildSensorTestSetup,
    buildSensorEnhancedGunnerySetup,
} from "../../../services/combat/procedures/vehicleDrivingTest";
import { openComposer } from "../../../services/combat/procedures/composerService.svelte";
import type { ProcedureSetup } from "../../../services/combat/procedures/simpleSetups";

const p = $props<{ characterActor: Actor; vehicle: Actor; vcr: Item | null; handlingTN: number }>();
const characterActor = untrack(() => p.characterActor);
const vehicle = untrack(() => p.vehicle);
const storeManager: IStoreManager = StoreManager.Instance as IStoreManager;

storeManager.Subscribe(characterActor);
onDestroy(() => storeManager.Unsubscribe(characterActor));

const activeSkills = $derived(
    [...((characterActor as any).items ?? [])].filter((item: any) => item.type === "skill" && item.system?.skillType === "active")
);
const activeSkillOptions = $derived(activeSkills.map((skill: any) => ({ value: skill.id, label: skill.name })));

// Flag-backed so the choices survive closing/reopening the sheet.
const vehicleSkillIdStore = storeManager.GetFlagStore<string>(characterActor, "garageVehicleSkillId", "");
const gunnerySkillIdStore = storeManager.GetFlagStore<string>(characterActor, "garageGunnerySkillId", "");

onMount(() => {
    if (activeSkills.length === 0) return;
    if (!$vehicleSkillIdStore) vehicleSkillIdStore.set(activeSkills[0].id);
    if (!$gunnerySkillIdStore) gunnerySkillIdStore.set(activeSkills[0].id);
});

function roll(setup: ProcedureSetup) {
    openComposer(setup, characterActor as never);
}

function onDrivingFamily(title: string) {
    if (!$vehicleSkillIdStore) return;
    roll(buildVehicleDrivingTestSetup(characterActor as never, $vehicleSkillIdStore, p.handlingTN, p.vcr as never, title));
}

function onOpenTest(title: string) {
    if (!$vehicleSkillIdStore) return;
    roll(buildVehicleOpenTestSetup(characterActor as never, $vehicleSkillIdStore, p.vcr as never, title));
}

function onSensorTest() {
    roll(buildSensorTestSetup(vehicle as never, localize(CONFIG.SR3E.INVENTORY.garagesensortest)));
}

function onSensorEnhancedGunnery() {
    if (!$gunnerySkillIdStore) return;
    roll(buildSensorEnhancedGunnerySetup(
        characterActor as never,
        vehicle as never,
        $gunnerySkillIdStore,
        p.vcr as never,
        localize(CONFIG.SR3E.INVENTORY.garagesensorenhancedgunnery),
    ));
}
</script>

<h4 class="no-margin uppercase">{localize(CONFIG.SR3E.INVENTORY.garageriggeractions)}</h4>

{#if activeSkills.length > 0}
    <div class="garage-rigger-actions-group">
        <LabeledDropdown
            key="vehicleSkill"
            label={localize(CONFIG.SR3E.INVENTORY.garagevehicleskill)}
            value={$vehicleSkillIdStore}
            options={activeSkillOptions}
            onUpdate={(v) => vehicleSkillIdStore.set(v)}
        />
        <div class="garage-rigger-actions-buttons">
            <button type="button" onclick={() => onOpenTest(localize(CONFIG.SR3E.INVENTORY.garagemaneuverscore))}>{localize(CONFIG.SR3E.INVENTORY.garagemaneuverscore)}</button>
            <button type="button" onclick={() => onDrivingFamily(localize(CONFIG.SR3E.INVENTORY.garageaccelerating))}>{localize(CONFIG.SR3E.INVENTORY.garageaccelerating)}</button>
            <button type="button" onclick={() => onDrivingFamily(localize(CONFIG.SR3E.INVENTORY.garagepositioning))}>{localize(CONFIG.SR3E.INVENTORY.garagepositioning)}</button>
            <button type="button" onclick={() => onDrivingFamily(localize(CONFIG.SR3E.INVENTORY.garageramming))}>{localize(CONFIG.SR3E.INVENTORY.garageramming)}</button>
            <button type="button" onclick={() => onOpenTest(localize(CONFIG.SR3E.INVENTORY.garagehiding))}>{localize(CONFIG.SR3E.INVENTORY.garagehiding)}</button>
            <button type="button" onclick={() => onDrivingFamily(localize(CONFIG.SR3E.INVENTORY.garagecrashtest))}>{localize(CONFIG.SR3E.INVENTORY.garagecrashtest)}</button>
        </div>
    </div>
{/if}

<div class="garage-rigger-actions-buttons">
    <button type="button" onclick={onSensorTest}>{localize(CONFIG.SR3E.INVENTORY.garagesensortest)}</button>
</div>

{#if activeSkills.length > 0}
    <div class="garage-rigger-actions-group">
        <LabeledDropdown
            key="gunnerySkill"
            label={localize(CONFIG.SR3E.INVENTORY.garagegunneryskill)}
            value={$gunnerySkillIdStore}
            options={activeSkillOptions}
            onUpdate={(v) => gunnerySkillIdStore.set(v)}
        />
        <div class="garage-rigger-actions-buttons">
            <button type="button" onclick={onSensorEnhancedGunnery}>{localize(CONFIG.SR3E.INVENTORY.garagesensorenhancedgunnery)}</button>
        </div>
    </div>
{/if}
