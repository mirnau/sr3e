import { buildSimpleRollSnapshot } from "./rollSnapshot";
import { extractDieResults, renderSimpleRollSummary } from "../../../ui/combat/chat/renderRollSummary";
import type { RerollFlag } from "./rerollHandler";
import type { SR3ERoll } from "./SR3ERoll";
import type { RollState } from "../diceFormula";
import type { ProcedureSetup } from "../procedures/simpleSetups";

export async function executeSimpleFlow(
    setup: ProcedureSetup,
    state: RollState,
    roll: SR3ERoll,
    actor: unknown,
    opts: { poolKey?: string } = {},
): Promise<void> {
    await setup.commitFn(roll.toSnapshot(), actor);

    if (!setup.selfPublish) return;

    const snapshot = buildSimpleRollSnapshot(roll, setup, state, opts.poolKey);
    const results = extractDieResults(roll.terms);
    const actorRef = actor as { name: string };
    const html = renderSimpleRollSummary(actorRef, snapshot, results);

    const actorId = (actor as any)?.id as string | undefined;
    const reroll: RerollFlag | undefined = actorId ? {
        actorId,
        actorName: (actor as any)?.name as string ?? "",
        pipeline: "simple",
        options: snapshot.options,
        meta: snapshot.meta,
        results,
        rerollCount: 0,
    } : undefined;

    const speaker = typeof ChatMessage !== "undefined"
        ? (ChatMessage as any).getSpeaker?.({ actor }) ?? {}
        : {};

    await (ChatMessage as any).create?.({
        content: html,
        speaker,
        rolls: roll.foundryRoll ? [roll.foundryRoll] : undefined,
        flags: reroll ? { sr3e: { reroll } } : undefined,
    });
}
