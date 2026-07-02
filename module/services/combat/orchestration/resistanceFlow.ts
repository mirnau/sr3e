import { buildResistance } from "../resistanceEngine";
import { resolveControllingUser } from "../engine/contestCoordinator";
import { captureHealthBaseline } from "../damageApplication";
import { renderResistancePrompt } from "../../../ui/combat/chat/renderResistancePrompt";
import { extractDieResults } from "../../../ui/combat/chat/renderRollSummary";
import { rerenderResistanceMessage, type ResistanceOutcomeFlag } from "./resistanceRerollHandler";
import type { ResistanceBuild } from "../resistanceEngine";
import type { ResistancePrep, RollSnapshot } from "../engine/types";

type Defender = {
    id?: string;
    name?: string;
    system: Record<string, unknown>;
    items?: { contents?: unknown[] };
    update?: (data: Record<string, unknown>) => Promise<unknown>;
};

// Posts the interactive resistance message — no damage is applied here.
// The defender can reroll/buy successes (Karma Pool, SR3E p.246) before
// committing via the message's Done button (handleResistanceDone), which
// applies the FINAL staged damage exactly once.
export async function executeResistanceRoll(
    prep: ResistancePrep,
    defender: Defender,
    roll: RollSnapshot,
): Promise<void> {
    const build: ResistanceBuild = buildResistance(
        defender as Parameters<typeof buildResistance>[0],
        {
            power: prep.tnBase,
            damageType: `${prep.stagedStepBeforeResist}${prep.trackKey === "stun" ? "s" : "p"}`,
            levelDelta: 0, attackTNAdd: 0, resistTNAdd: 0,
            armorUse: "ballistic" as const,
            armorMult: { ballistic: 1, impact: 1 },
            notes: [],
        },
        0,
    );

    const baseline = captureHealthBaseline(defender as never);
    const flag: ResistanceOutcomeFlag = {
        actorId: defender.id ?? "",
        actorName: defender.name ?? "Defender",
        prep,
        build,
        baseline,
        options: roll.options,
        meta: roll.meta,
        results: extractDieResults(roll.terms),
        rerollCount: 0,
    };

    if (typeof ChatMessage !== "undefined") {
        await (ChatMessage as any).create?.({
            content: rerenderResistanceMessage(flag),
            flags: { sr3e: { resistanceOutcome: flag } },
        });
    }
}

export async function promptResistance(prep: ResistancePrep, defender: Defender): Promise<void> {
    if (typeof game === "undefined" || !game.socket) return;

    const controller = resolveControllingUser(defender as never);
    if (!controller) return;

    const whisperIds = [controller.id as string];
    const defenderActorId = defender.id ?? "";
    const html = renderResistancePrompt(prep, { name: defender.name ?? "Defender" }, prep.weaponName);

    if (typeof ChatMessage !== "undefined") {
        await (ChatMessage as unknown as { create: (data: Record<string, unknown>) => Promise<unknown> }).create({
            content: html,
            whisper: whisperIds,
            flags: { sr3e: { damageResistance: { prep, defenderActorId } } },
        });
    }
}
