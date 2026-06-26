import { computeFinalTN } from "../diceFormula";
import type { RollState } from "../diceFormula";
import type { RollSnapshot } from "../engine/types";
import type { SR3ERoll } from "./SR3ERoll";
import type { ProcedureSetup } from "../procedures/simpleSetups";

function procedureType(kind: string): "skill" | "attribute" | "item" {
    if (kind === "skill") return "skill";
    if (kind === "attribute") return "attribute";
    return "item";
}

function baseSnapshot(roll: SR3ERoll, setup: ProcedureSetup, state: RollState, poolKey?: string) {
    return {
        terms: roll.terms,
        options: {
            baseDice: state.dice,
            poolDice: state.poolDice,
            karmaDice: state.karmaDice,
            poolKey,
            type: procedureType(setup.kind),
        },
        meta: {
            flavor: setup.title,
            procedureKind: setup.kind,
        },
    };
}

export function buildSimpleRollSnapshot(
    roll: SR3ERoll,
    setup: ProcedureSetup,
    state: RollState,
    poolKey?: string,
): RollSnapshot {
    const base = baseSnapshot(roll, setup, state, poolKey);
    return { ...base, options: { ...base.options, targetNumber: null } };
}

export function buildRollSnapshot(
    roll: SR3ERoll,
    setup: ProcedureSetup,
    state: RollState,
    poolKey?: string,
): RollSnapshot {
    const base = baseSnapshot(roll, setup, state, poolKey);
    return {
        ...base,
        options: {
            ...base.options,
            targetNumber: computeFinalTN(state, 2),
            tnBase: state.targetNumber,
            tnMods: state.modifiers,
        },
    };
}
