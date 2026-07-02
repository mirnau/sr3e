import { startContest, waitForResponse, waitForBothDone, computeNetSuccesses } from "../engine/contestCoordinator";
import { handleContestStub } from "./defenderFlow";
import { serializeProcedure } from "../engine/procedureSerializer";
import { buildRollSnapshot } from "./rollSnapshot";
import { promptResistance } from "./resistanceFlow";
import { renderContestOutcome } from "../../../ui/combat/chat/renderContestOutcome";
import { extractDieResults } from "../../../ui/combat/chat/renderRollSummary";
import { boxesForLevel } from "../damageMath";
import { renderSpellDamageStaging, spellDamageStaging } from "../../spells/spellCombat";
import { computeFinalNetSuccesses, type ContestOutcomeFlag } from "./contestRerollHandler";
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

        const { contestId, stub } = startContest(
            serialized,
            exportCtx,
            setup.defenseHint ?? { type: "attribute", key: "reaction", tnMod: 0, tnLabel: "Reaction" },
            targetActor as never,
            target as never,
            initiatorRoll,
        );

        void handleContestStub(stub);

        const defenderRoll = await waitForResponse(contestId);

        if (isAborted(defenderRoll)) {
            // Cancellation chat already posted by handleDefenderChoice
            continue;
        }

        const netSuccesses = computeNetSuccesses(initiatorRoll, defenderRoll);

        const initiatorName = (actor as unknown as { name?: string }).name ?? "Attacker";
        const targetName = (targetActor as unknown as { name?: string }).name ?? "Defender";
        const staging = spellDamageStaging(exportCtx, initiatorRoll, defenderRoll);
        const outcomeHtml = renderContestOutcome({
            initiator: { name: initiatorName },
            target: { name: targetName },
            weaponName: exportCtx.weaponName,
            initiatorRoll,
            targetRoll: defenderRoll,
            netSuccesses,
            extraHtml: renderSpellDamageStaging(staging),
        });
        if (typeof ChatMessage !== "undefined") {
            const contestOutcomeFlag: ContestOutcomeFlag = {
                contestId,
                weaponName: exportCtx.weaponName,
                exportCtx,
                initiator: {
                    actorId: (actor as unknown as { id: string }).id,
                    actorName: initiatorName,
                    options: initiatorRoll.options,
                    meta: initiatorRoll.meta,
                    results: extractDieResults(initiatorRoll.terms),
                    rerollCount: 0,
                    done: false,
                },
                target: {
                    actorId: (targetActor as unknown as { id: string }).id,
                    actorName: targetName,
                    options: defenderRoll.options,
                    meta: defenderRoll.meta,
                    results: extractDieResults(defenderRoll.terms),
                    rerollCount: 0,
                    done: false,
                },
            };

            await (ChatMessage as any).create?.({
                content: outcomeHtml,
                speaker: (ChatMessage as any).getSpeaker?.({ actor }),
                flags: { sr3e: { contestOutcome: contestOutcomeFlag } },
            });

            // Wait for both sides to click Done (they may reroll/buy in the
            // meantime, changing who actually has net successes) before
            // deciding whether damage/resistance follows — a race between
            // posting this message and immediately resolving it defeats the
            // entire point of making rerolls interactive.
            const finalFlag = await waitForBothDone(contestId) as ContestOutcomeFlag;
            const finalNetSuccesses = computeFinalNetSuccesses(finalFlag);

            if (finalNetSuccesses > 0 && exportCtx.damage) {
                const stagedStep = "m" as const;
                const resistPrep: ResistancePrep = {
                    familyKey: exportCtx.familyKey,
                    weaponId: exportCtx.weaponId,
                    weaponName: exportCtx.weaponName,
                    tnBase: exportCtx.tnBase,
                    tnMods: exportCtx.tnMods,
                    stagedStepBeforeResist: stagedStep,
                    trackKey: "physical",
                    boxesIfUnresisted: boxesForLevel(stagedStep),
                };
                await resistFn(resistPrep, targetActor as never);
            }
        }
    }

    await setup.commitFn(roll.toSnapshot(), actor);
}
