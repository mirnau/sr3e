import { buildRollSnapshot } from "./rollSnapshot";
import { renderRollSummary } from "../../../ui/combat/chat/renderRollSummary";
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

    const snapshot = buildRollSnapshot(roll, setup, state, opts.poolKey);
    const html = renderRollSummary(actor as { name: string }, snapshot);

    const speaker = typeof ChatMessage !== "undefined"
        ? (ChatMessage as any).getSpeaker?.({ actor }) ?? {}
        : {};

    await (ChatMessage as any).create?.({ content: html, speaker });
}
