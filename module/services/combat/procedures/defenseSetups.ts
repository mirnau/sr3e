import { deliverResponse, getContest } from "../engine/contestCoordinator";
import type { ProcedureSetup } from "./simpleSetups";
import type { RollSnapshot, ContestExport } from "../engine/types";

type AttributeMap = Record<string, { value?: number; total?: number }>;
type ActorSystem = { attributes?: AttributeMap };
type Defender = { system: Record<string, unknown> };

// SR3E p.113: +1 TN per 3 rounds fired from burst or full-auto fire.
function dodgeTNMod(exportCtx: ContestExport | undefined): number {
    const rounds = exportCtx?.plan?.roundsFired ?? 1;
    return Math.floor(rounds / 3);
}

export function buildDodgeSetup(defender: Defender, contestId: string): ProcedureSetup {
    const record = getContest(contestId);
    const tnMod = dodgeTNMod(record?.exportCtx);
    const targetNumber = 4 + tnMod;

    const modifiers = tnMod > 0
        ? [{ id: "rounds-fired", name: `Rounds fired (+${tnMod})`, value: tnMod }]
        : [];

    const rollState = { dice: 0, poolDice: 0, karmaDice: 0, targetNumber, modifiers };

    return {
        kind: "dodge",
        title: "Dodge",
        rollState,
        lockPriority: "simple",
        selfPublish: false,
        defenseHint: null,
        initialPoolKey: "combat",
        exportFn: () => ({
            familyKey: "dodge",
            weaponId: null,
            weaponName: "",
            plan: null,
            damage: null,
            tnBase: targetNumber,
            tnMods: modifiers,
            next: { kind: "", ui: {}, args: {} },
        }),
        commitFn: async (roll: unknown) => {
            deliverResponse(contestId, roll as RollSnapshot);
        },
    };
}

export type MeleeDefenseBasis = {
    type: "attribute" | "skill";
    key: string;
    name: string;
    dice: number;
    isDefaulting?: boolean;
    id?: string;
    specialization?: string | null;
    specIndex?: number | null;
};

export type MeleeDefenseMode = "standard" | "full";

export function buildMeleeDefenseSetup(
    _defender: Defender,
    basis: MeleeDefenseBasis,
    mode: MeleeDefenseMode,
    contestId: string,
): ProcedureSetup {
    const forbidPool = mode === "full";

    const modifiers = forbidPool
        ? [{ name: "full-defense", value: 0, forbidPool: true }]
        : [];

    const rollState = { dice: basis.dice, poolDice: 0, karmaDice: 0, targetNumber: 4, modifiers };

    return {
        kind: "melee-defense",
        title: mode === "full" ? "Full Defense" : "Melee Defense",
        rollState,
        lockPriority: "advanced",
        selfPublish: false,
        defenseHint: null,
        exportFn: () => ({
            familyKey: "melee-defense",
            weaponId: null,
            weaponName: "",
            plan: null,
            damage: null,
            tnBase: 4,
            tnMods: [],
            next: { kind: "", ui: {}, args: {} },
        }),
        commitFn: async (roll: unknown) => {
            deliverResponse(contestId, roll as RollSnapshot);
        },
    };
}
