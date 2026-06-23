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

export function buildRollSnapshot(
    roll: SR3ERoll,
    setup: ProcedureSetup,
    state: RollState,
): RollSnapshot {
    const tn = computeFinalTN(state, 2);

    return {
        terms: roll.terms,
        options: {
            targetNumber: tn,
            tnBase: state.targetNumber,
            tnMods: state.modifiers,
            baseDice: state.dice,
            poolDice: state.poolDice,
            karmaDice: state.karmaDice,
            type: procedureType(setup.kind),
        },
        meta: {
            flavor: setup.title,
            procedureKind: setup.kind,
        },
    };
}
