import type { SR3ERoll } from "./SR3ERoll";
import type { RollState } from "../diceFormula";
import type { ProcedureSetup } from "../procedures/simpleSetups";

export async function executeSimpleFlow(
    setup: ProcedureSetup,
    _state: RollState,
    roll: SR3ERoll,
    actor: unknown,
): Promise<void> {
    await setup.commitFn(roll.toSnapshot(), actor);

    if (setup.selfPublish) {
        const speaker = typeof ChatMessage !== "undefined"
            ? (ChatMessage as unknown as { getSpeaker?: () => unknown }).getSpeaker?.() ?? {}
            : {};
        await roll.toMessage({ flavor: setup.title, speaker });
    }
}
