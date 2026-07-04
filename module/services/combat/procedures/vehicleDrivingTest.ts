import { buildSkillSetup, type ProcedureSetup } from "./simpleSetups";
import type { Modifier } from "../modifierList";
import type { RollSnapshot } from "../engine/types";
import { highestOpenTestDie } from "../openTestResult";
import { countTnSuccesses } from "../successCount";
import { terrainPoints, type TerrainCategory } from "../terrainCategory";

type ActorWithItems = { items: { get?: (id: string) => { system?: Record<string, unknown> } | undefined } };
type Vcr = { system?: { level?: number } } | null;
type VehicleWithSensor = { system?: { sensor?: { value?: number } } };
type UpdatableVehicle = VehicleWithSensor & { update?: (d: Record<string, unknown>) => Promise<unknown> };
type VehicleWithPerformance = {
    system?: { accel?: { value?: number }; currentSpeed?: { value?: number }; maxSpeed?: { value?: number } };
};
type UpdatableVehicleWithPerformance = VehicleWithPerformance & { update?: (d: Record<string, unknown>) => Promise<unknown> };

function vcrLevel(vcr: Vcr): number {
    return Number(vcr?.system?.level ?? 0);
}

function skillRating(actor: ActorWithItems, skillId: string): number {
    const skill = actor.items.get?.(skillId);
    return Number((skill?.system as { activeSkill?: { value?: number } } | undefined)?.activeSkill?.value ?? 0);
}

// A visible TN modifier rather than baking the reduction directly into
// targetNumber — the composer already renders each modifier by name, so
// this keeps the VCR's effect legible instead of just presenting an
// already-reduced number with no indication of where it came from.
// computeFinalTN applies the floor of 2 downstream; no need to clamp here.
function vcrTnModifier(vcr: Vcr): Modifier[] {
    const level = vcrLevel(vcr);
    return vcr ? [{ id: "vcr-tn-reduction", name: "VCR Rating", value: -level }] : [];
}

// Positioning, Ramming, Hiding, and Crash Test are all the same
// underlying test as the Standard Driving Test (Vehicle Skill vs
// Handling, TN reduced by VCR level, Control Pool capped at skill
// rating) — this phase doesn't automate their distinct outcomes
// (carried-over Driver Points, collision damage reduction), so they only
// differ by button label/title and which extra modifiers the caller
// passes in (e.g. the Maneuver Score comparison, which only applies to
// some of these actions per SR3 p.141/143/144). Accelerate/Brake use the
// same setup but need their own builder below since their outcome
// (a speed change) IS automated.
export function buildVehicleDrivingTestSetup(
    character: ActorWithItems,
    skillId: string,
    handlingTN: number,
    vcr: Vcr,
    title: string,
    extraModifiers: Modifier[] = [],
): ProcedureSetup {
    const setup = buildSkillSetup(character as never, skillId, null, title, handlingTN);
    setup.rollState = { ...setup.rollState, modifiers: [...setup.rollState.modifiers, ...vcrTnModifier(vcr), ...extraModifiers] };
    if (vcr) {
        setup.poolAvailableOverrides = { control: skillRating(character, skillId) };
    }
    return setup;
}

export type AccelerateBrakeDirection = "accelerate" | "brake";

// SR3 p.142 — Change in Speed = Acceleration Rating x successes. Same
// Driving Test as buildVehicleDrivingTestSetup; only the commitFn differs,
// applying the computed delta to system.currentSpeed automatically
// (accelerate adds, brake subtracts), clamped to [0, maxSpeed] if
// maxSpeed is set. Successes are counted against the roll's own final TN
// (post VCR/terrain/comparison modifiers), not the raw Handling TN, so
// this agrees with what the player actually saw and rolled against.
export function buildAccelerateBrakeSetup(
    character: ActorWithItems,
    vehicle: UpdatableVehicleWithPerformance,
    skillId: string,
    handlingTN: number,
    vcr: Vcr,
    direction: AccelerateBrakeDirection,
    title: string,
    extraModifiers: Modifier[] = [],
): ProcedureSetup {
    const setup = buildVehicleDrivingTestSetup(character, skillId, handlingTN, vcr, title, extraModifiers);
    setup.commitFn = async (roll: unknown) => {
        const snapshot = roll as RollSnapshot;
        const finalTN = snapshot.options.targetNumber ?? handlingTN;
        const successes = countTnSuccesses(snapshot.terms ?? [], finalTN);
        const accel = Number(vehicle.system?.accel?.value ?? 0);
        const currentSpeed = Number(vehicle.system?.currentSpeed?.value ?? 0);
        const maxSpeed = Number(vehicle.system?.maxSpeed?.value ?? 0);
        const delta = successes * accel * (direction === "accelerate" ? 1 : -1);
        const ceiling = maxSpeed > 0 ? maxSpeed : Infinity;
        const newSpeed = Math.max(0, Math.min(ceiling, currentSpeed + delta));
        await vehicle.update?.({ "system.currentSpeed.value": newSpeed });
    };
    return setup;
}

// Maneuver Score (Driver Points) is an Open Test: Vehicle Skill dice, no
// target number, Control Pool capped at skill rating.
export function buildVehicleOpenTestSetup(
    character: ActorWithItems,
    skillId: string,
    vcr: Vcr,
    title: string,
): ProcedureSetup {
    const setup = buildSkillSetup(character as never, skillId, null, title, 4);
    setup.openRoll = true;
    setup.openTest = true;
    if (vcr) {
        setup.poolAvailableOverrides = { control: skillRating(character, skillId) };
    }
    return setup;
}

// Maneuver Score's Driver Points component: same Open Test as above, but
// the result (highest single die, Rule of Six applied via SR3Edie's own
// chain accumulation — see openTestResult.ts) plus the current terrain's
// Terrain Points is written back to the vehicle automatically. Vehicle
// Points/Speed Points aren't computed yet, so system.maneuverScore is
// Driver Points + Terrain Points for now, not the full SR3 formula.
export function buildManeuverScoreSetup(
    character: ActorWithItems,
    vehicle: UpdatableVehicle,
    skillId: string,
    vcr: Vcr,
    title: string,
    terrain: TerrainCategory,
): ProcedureSetup {
    const setup = buildVehicleOpenTestSetup(character, skillId, vcr, title);
    setup.commitFn = async (roll: unknown) => {
        const snapshot = roll as RollSnapshot;
        const driverPoints = highestOpenTestDie(snapshot.terms ?? []);
        await vehicle.update?.({ "system.maneuverScore": driverPoints + terrainPoints(terrain) });
    };
    return setup;
}

// Sensor Rating lives on the vehicle, not the character — no skill
// involved, no Control Pool cap (Sensor Rating isn't a skill rating).
export function buildSensorTestSetup(vehicle: VehicleWithSensor, title: string): ProcedureSetup {
    const dice = Number(vehicle.system?.sensor?.value ?? 0);
    return {
        kind: "attribute",
        title,
        rollState: { dice, poolDice: 0, karmaDice: 0, targetNumber: 4, modifiers: [] },
        lockPriority: "simple",
        selfPublish: true,
        defenseHint: null,
        exportFn: () => ({
            familyKey: "attribute",
            weaponId: null,
            weaponName: title,
            plan: null,
            damage: null,
            tnBase: 4,
            tnMods: [],
            next: { kind: "", ui: {}, args: {} },
        }),
        commitFn: async () => {},
    };
}

// Gunnery Skill + half Sensor Rating (rounded down), TN 4 minus VCR level.
// No weapon selection/damage automation this phase — the roll itself is
// identical whichever mounted weapon it's fictionally aimed with.
export function buildSensorEnhancedGunnerySetup(
    character: ActorWithItems,
    vehicle: VehicleWithSensor,
    skillId: string,
    vcr: Vcr,
    title: string,
): ProcedureSetup {
    const baseRating = skillRating(character, skillId);
    const sensorBonus = Math.floor(Number(vehicle.system?.sensor?.value ?? 0) / 2);
    const setup = buildSkillSetup(character as never, skillId, null, title, 4);
    setup.rollState = {
        ...setup.rollState,
        dice: setup.rollState.dice + sensorBonus,
        modifiers: [...setup.rollState.modifiers, ...vcrTnModifier(vcr)],
    };
    setup.poolAvailableOverrides = { control: baseRating };
    return setup;
}
