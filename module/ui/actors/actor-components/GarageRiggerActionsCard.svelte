<script lang="ts">
import { onDestroy, onMount, untrack } from "svelte";
import { localize } from "../../../services/utilities";
import type { IStoreManager } from "../../../utilities/IStoreManager";
import { StoreManager } from "../../../utilities/StoreManager.svelte";
import LabeledDropdown from "../../items/LabeledDropdown.svelte";
import {
    buildVehicleDrivingTestSetup,
    buildAccelerateBrakeSetup,
    buildManeuverScoreSetup,
    buildSensorTestSetup,
    buildSensorEnhancedGunnerySetup,
    type AccelerateBrakeDirection,
} from "../../../services/combat/procedures/vehicleDrivingTest";
import { maneuverScoreComparisonModifier, type ManeuverScoreRollKind } from "../../../services/combat/maneuverScoreModifier";
import { terrainDrivingModifier, type TerrainCategory } from "../../../services/combat/terrainCategory";
import { openComposer } from "../../../services/combat/procedures/composerService.svelte";
import type { ProcedureSetup } from "../../../services/combat/procedures/simpleSetups";

const p = $props<{
    characterActor: Actor;
    vehicle: Actor;
    vcr: Item | null;
    handlingTN: number;
    maneuverScore: number;
    exceedsBrakingLimit: boolean;
    onCrashTestAcknowledge: () => void;
}>();
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
// Stored as a string so "left blank" is representable — parsed to null
// (treated as "assumed equal", per direction) rather than 0.
const opposingScoreStore = storeManager.GetFlagStore<string>(characterActor, "garageOpposingManeuverScore", "");
const opposingScore = $derived.by(() => {
    const raw = $opposingScoreStore.trim();
    return raw === "" ? null : Number(raw);
});
// Shared across drivers of this vehicle — current terrain is a fact about
// the scene, not a per-character choice, so one flag on the character
// currently in the driver's seat is enough.
const terrainStore = storeManager.GetFlagStore<TerrainCategory>(characterActor, "garageCurrentTerrain", "normal");
const terrainOptions = [
    { value: "open", label: localize(CONFIG.SR3E.INVENTORY.garageterrainopen) },
    { value: "normal", label: localize(CONFIG.SR3E.INVENTORY.garageterrainnormal) },
    { value: "restricted", label: localize(CONFIG.SR3E.INVENTORY.garageterrainrestricted) },
    { value: "tight", label: localize(CONFIG.SR3E.INVENTORY.garageterraintight) },
];

onMount(() => {
    if (activeSkills.length === 0) return;
    if (!$vehicleSkillIdStore) vehicleSkillIdStore.set(activeSkills[0].id);
    if (!$gunnerySkillIdStore) gunnerySkillIdStore.set(activeSkills[0].id);
});

function roll(setup: ProcedureSetup) {
    openComposer(setup, characterActor as never);
}

// kind absent = this action has no Maneuver Score comparison rule
// (Positioning, Crash Test) — only the ones SR3 actually lists get it.
// Terrain's Driving Test Modifier, unlike the comparison, applies to
// every driving test unconditionally (it's a property of the ground,
// not a tactical advantage).
function onDrivingFamily(title: string, kind: ManeuverScoreRollKind | null = null) {
    if (!$vehicleSkillIdStore) return;
    const comparisonMods = kind ? maneuverScoreComparisonModifier(p.maneuverScore, opposingScore, kind) : [];
    const mods = [...comparisonMods, ...terrainDrivingModifier($terrainStore)];
    roll(buildVehicleDrivingTestSetup(characterActor as never, $vehicleSkillIdStore, p.handlingTN, p.vcr as never, title, mods));
}

function onCrashTest() {
    onDrivingFamily(localize(CONFIG.SR3E.INVENTORY.garagecrashtest));
    p.onCrashTestAcknowledge();
}

// Separate from onDrivingFamily: the outcome here is automated (SR3
// p.142 Change in Speed = Acceleration Rating x successes), so it needs
// buildAccelerateBrakeSetup's commitFn rather than the generic driving
// test's no-op one.
function onAccelerateBrake(direction: AccelerateBrakeDirection, title: string) {
    if (!$vehicleSkillIdStore) return;
    const comparisonMods = maneuverScoreComparisonModifier(p.maneuverScore, opposingScore, "accelBrakeRam");
    const mods = [...comparisonMods, ...terrainDrivingModifier($terrainStore)];
    roll(buildAccelerateBrakeSetup(characterActor as never, vehicle as never, $vehicleSkillIdStore, p.handlingTN, p.vcr as never, direction, title, mods));
}

function onManeuverScore() {
    if (!$vehicleSkillIdStore) return;
    roll(buildManeuverScoreSetup(
        characterActor as never,
        vehicle as never,
        $vehicleSkillIdStore,
        p.vcr as never,
        localize(CONFIG.SR3E.INVENTORY.garagemaneuverscore),
        $terrainStore,
    ));
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

<div class="stat-card stat-field-card labeled-field-card">
    <div class="stat-card-background"></div>
    <div class="title-container">
        <h4 class="no-margin uppercase">{localize(CONFIG.SR3E.INVENTORY.garageopposingmaneuverscore)}</h4>
    </div>
    <div class="select-wrapper narrow">
        <div class="select-background"></div>
        <input
            type="number"
            value={$opposingScoreStore}
            placeholder="="
            oninput={(e) => opposingScoreStore.set((e.target as HTMLInputElement).value)}
        />
    </div>
</div>

<LabeledDropdown
    key="terrain"
    label={localize(CONFIG.SR3E.INVENTORY.garageterrain)}
    value={$terrainStore}
    options={terrainOptions}
    onUpdate={(v) => terrainStore.set(v as TerrainCategory)}
/>

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
            <button type="button" onclick={onManeuverScore}>{localize(CONFIG.SR3E.INVENTORY.garagemaneuverscore)}</button>
            <button type="button" onclick={() => onAccelerateBrake("accelerate", localize(CONFIG.SR3E.INVENTORY.garageaccelerate))}>{localize(CONFIG.SR3E.INVENTORY.garageaccelerate)}</button>
            <button type="button" onclick={() => onAccelerateBrake("brake", localize(CONFIG.SR3E.INVENTORY.garagebrake))}>{localize(CONFIG.SR3E.INVENTORY.garagebrake)}</button>
            <button type="button" onclick={() => onDrivingFamily(localize(CONFIG.SR3E.INVENTORY.garagepositioning))}>{localize(CONFIG.SR3E.INVENTORY.garagepositioning)}</button>
            <button type="button" onclick={() => onDrivingFamily(localize(CONFIG.SR3E.INVENTORY.garageramming), "accelBrakeRam")}>{localize(CONFIG.SR3E.INVENTORY.garageramming)}</button>
            <button type="button" onclick={() => onDrivingFamily(localize(CONFIG.SR3E.INVENTORY.garagehiding), "hiding")}>{localize(CONFIG.SR3E.INVENTORY.garagehiding)}</button>
            <button
                type="button"
                class:garage-crash-test-warning={p.exceedsBrakingLimit}
                onclick={onCrashTest}
            >{localize(CONFIG.SR3E.INVENTORY.garagecrashtest)}</button>
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
