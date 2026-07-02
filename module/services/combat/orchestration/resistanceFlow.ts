import { SR3ERoll } from "./SR3ERoll";
import { buildResistance, resolveResistance } from "../resistanceEngine";
import { resolveControllingUser } from "../engine/contestCoordinator";
import { applyDamageBoxes, getTrackValue } from "../damageApplication";
import { renderResistancePrompt } from "../../../ui/combat/chat/renderResistancePrompt";
import { renderResistanceOutcome } from "../../../ui/combat/chat/renderResistanceOutcome";
import type { ResistancePrep } from "../engine/types";
import type { RollState } from "../diceFormula";
import type { ResistanceBuild } from "../resistanceEngine";

const TRACK_MAX = 10;

type Defender = {
    id?: string;
    name?: string;
    system: Record<string, unknown>;
    items?: { contents?: unknown[] };
    update?: (data: Record<string, unknown>) => Promise<unknown>;
};

function bodyRating(defender: Defender): number {
    const attrs = (defender.system as { attributes?: Record<string, { value?: number; total?: number }> }).attributes ?? {};
    return attrs.body?.total ?? attrs.body?.value ?? 1;
}

export async function executeResistanceRoll(
    prep: ResistancePrep & { build?: ResistanceBuild },
    defender: Defender,
    finalState: RollState,
): Promise<void> {
    const tn = prep.tnBase + prep.tnMods.reduce((s, m) => s + m.value, 0);
    const dice = Math.max(1, bodyRating(defender));

    const roll = SR3ERoll.build(finalState.dice || dice, tn);
    await roll.evaluate();

    const bodySuccesses = roll.countSuccesses() ?? 0;

    const build = buildResistance(
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

    const outcome = resolveResistance(build, bodySuccesses);

    const track = prep.trackKey as "stun" | "physical";
    const currentBoxes = getTrackValue(defender, track);
    const overflowBoxes = outcome.applied
        ? Math.max(0, currentBoxes + outcome.boxes - TRACK_MAX)
        : 0;

    if (outcome.applied && outcome.boxes > 0) {
        await applyDamageBoxes(defender, defender.id ?? "", track, outcome.boxes);
    }

    if (typeof Hooks !== "undefined") {
        Hooks.callAll("actorSystemRecalculated", defender);
    }

    const outcomeHtml = renderResistanceOutcome(
        outcome, prep, defender.name ?? "Defender", bodySuccesses, tn, overflowBoxes,
    );
    if (typeof ChatMessage !== "undefined") {
        await (ChatMessage as any).create?.({ content: outcomeHtml });
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
