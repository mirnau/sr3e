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

    if (setup.selfPublish && typeof ChatMessage !== "undefined") {
        await ChatMessage.create({
            content: `<p>${setup.title} — ${roll.countSuccesses()} success(es)</p>`,
            speaker: ChatMessage.getSpeaker?.() ?? {},
        });
    }
}
