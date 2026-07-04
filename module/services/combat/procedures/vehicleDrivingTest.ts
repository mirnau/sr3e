import { buildSkillSetup, type ProcedureSetup } from "./simpleSetups";
import type { Modifier } from "../modifierList";

type ActorWithItems = { items: { get?: (id: string) => { system?: Record<string, unknown> } | undefined } };
type Vcr = { system?: { level?: number } } | null;
type VehicleWithSensor = { system?: { sensor?: { value?: number } } };

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

// Accelerating/Braking, Positioning, Ramming, and Crash Test are all the
// same underlying test as the Standard Driving Test (Vehicle Skill vs
// Handling, TN reduced by VCR level, Control Pool capped at skill rating)
// — this phase doesn't automate their distinct outcomes (speed deltas,
// carried-over Driver Points, collision damage reduction), so they only
// differ by button label/title.
export function buildVehicleDrivingTestSetup(
    character: ActorWithItems,
    skillId: string,
    handlingTN: number,
    vcr: Vcr,
    title: string,
): ProcedureSetup {
    const setup = buildSkillSetup(character as never, skillId, null, title, handlingTN);
    setup.rollState = { ...setup.rollState, modifiers: [...setup.rollState.modifiers, ...vcrTnModifier(vcr)] };
    if (vcr) {
        setup.poolAvailableOverrides = { control: skillRating(character, skillId) };
    }
    return setup;
}

// Maneuver Score (Driver Points) and Hiding are Open Tests: Vehicle Skill
// dice, no target number, Control Pool capped at skill rating. No
// "highest single die" extraction — the exploding-dice pool display is
// read manually, matching this project's no-automated-enforcement pattern.
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
