import { buildRollSnapshot } from "./rollSnapshot";
import { extractDieResults, renderAdvancedRollSummary } from "../../../ui/combat/chat/renderRollSummary";
import type { RerollFlag } from "./rerollHandler";
import type { SR3ERoll } from "./SR3ERoll";
import type { RollState } from "../diceFormula";
import type { ProcedureSetup } from "../procedures/simpleSetups";

export async function executeAdvancedFlow(
    setup: ProcedureSetup,
    state: RollState,
    roll: SR3ERoll,
    actor: unknown,
    opts: { poolKey?: string } = {},
): Promise<void> {
    await setup.commitFn(roll.toSnapshot(), actor);

    if (!setup.selfPublish) return;

    const snapshot = buildRollSnapshot(roll, setup, state, opts.poolKey);
    const results = extractDieResults(roll.terms);
    const actorRef = actor as { name: string };
    const html = renderAdvancedRollSummary(actorRef, snapshot, results);

    const actorId = (actor as any)?.id as string | undefined;
    const reroll: RerollFlag | undefined = actorId ? {
        actorId,
        actorName: (actor as any)?.name as string ?? "",
        pipeline: "advanced",
        options: snapshot.options,
        meta: snapshot.meta,
        results,
    } : undefined;

    const speaker = typeof ChatMessage !== "undefined"
        ? (ChatMessage as any).getSpeaker?.({ actor }) ?? {}
        : {};

    await (ChatMessage as any).create?.({
        content: html,
        speaker,
        flags: reroll ? { sr3e: { reroll } } : undefined,
    });
}
