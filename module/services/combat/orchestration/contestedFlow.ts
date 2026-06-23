import { startContest, waitForResponse, computeNetSuccesses } from "../engine/contestCoordinator";
import { serializeProcedure } from "../engine/procedureSerializer";
import { buildRollSnapshot } from "./rollSnapshot";
import { promptResistance } from "./resistanceFlow";
import type { SR3ERoll } from "./SR3ERoll";
import type { RollState } from "../diceFormula";
import type { ProcedureSetup } from "../procedures/simpleSetups";
import type { ResistancePrep, RollSnapshot } from "../engine/types";

const ABORT_PROCEDURE_KIND = "__aborted";

function isAborted(roll: RollSnapshot): boolean {
    return roll.meta.procedureKind === ABORT_PROCEDURE_KIND;
}

export async function executeContestedFlow(
    setup: ProcedureSetup,
    state: RollState,
    roll: SR3ERoll,
    actor: { id: string; system: Record<string, unknown> },
    targets: Array<{ id?: string; scene?: { id?: string }; actor?: { id: string; system: Record<string, unknown>; items?: unknown } }>,
    opts: {
        promptResistanceFn?: typeof promptResistance;
    } = {},
): Promise<void> {
    const initiatorRoll = buildRollSnapshot(roll, setup, state);
    const exportCtx = setup.exportFn();
    const resistFn = opts.promptResistanceFn ?? promptResistance;

    const weapon = exportCtx.weaponId
        ? { id: exportCtx.weaponId, uuid: exportCtx.weaponId } as never
        : null;

    const serialized = serializeProcedure(
        setup.kind,
        actor as never,
        weapon,
        state,
        exportCtx,
    );

    for (const target of targets) {
        const targetActor = target.actor ?? null;
        if (!targetActor) continue;

        const contestId = startContest(
            serialized,
            exportCtx,
            setup.defenseHint ?? { type: "attribute", key: "reaction", tnMod: 0, tnLabel: "Reaction" },
            targetActor as never,
            target as never,
            initiatorRoll,
        );

        const defenderRoll = await waitForResponse(contestId);

        const netSuccesses = isAborted(defenderRoll)
            ? roll.countSuccesses()
            : computeNetSuccesses(initiatorRoll, defenderRoll);

        if (netSuccesses > 0 && exportCtx.damage) {
            const resistPrep: ResistancePrep = {
                familyKey: exportCtx.familyKey,
                weaponId: exportCtx.weaponId,
                weaponName: exportCtx.weaponName,
                tnBase: exportCtx.tnBase,
                tnMods: exportCtx.tnMods,
                stagedStepBeforeResist: "m",
                trackKey: "physical",
            };
            await resistFn(resistPrep, targetActor as never);
        }
    }

    await setup.commitFn(roll.toSnapshot(), actor);
}
