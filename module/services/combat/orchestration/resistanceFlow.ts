import { SR3ERoll } from "./SR3ERoll";
import { buildResistance, resolveResistance } from "../resistanceEngine";
import { resolveControllingUser } from "../engine/contestCoordinator";
import { renderResistancePrompt } from "../../../ui/combat/chat/renderResistancePrompt";
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

type HealthSystem = {
    stun?: { value?: number };
    physical?: { value?: number };
    overflow?: { value?: number };
};

function getTrackValue(defender: Defender, track: "stun" | "physical"): number {
    const h = (defender.system as { health?: HealthSystem }).health ?? {};
    return h[track]?.value ?? 0;
}

function getOverflow(defender: Defender): number {
    const h = (defender.system as { health?: HealthSystem }).health ?? {};
    return h.overflow?.value ?? 0;
}

function bodyRating(defender: Defender): number {
    const attrs = (defender.system as { attributes?: Record<string, { value?: number; total?: number }> }).attributes ?? {};
    return attrs.body?.total ?? attrs.body?.value ?? 1;
}

async function applyDamageBoxes(
    defender: Defender,
    track: "stun" | "physical",
    boxes: number,
): Promise<void> {
    if (boxes <= 0) return;

    const current = getTrackValue(defender, track);
    const newValue = Math.min(current + boxes, TRACK_MAX);
    const overflow = Math.max(0, current + boxes - TRACK_MAX);

    const updates: Record<string, unknown> = { [`system.health.${track}.value`]: newValue };

    if (overflow > 0) {
        if (track === "stun") {
            const physCurrent = getTrackValue(defender, "physical");
            const newPhys = Math.min(physCurrent + overflow, TRACK_MAX);
            const physOverflow = Math.max(0, physCurrent + overflow - TRACK_MAX);
            updates["system.health.physical.value"] = newPhys;
            if (physOverflow > 0) {
                updates["system.health.overflow.value"] = getOverflow(defender) + physOverflow;
            }
        } else {
            updates["system.health.overflow.value"] = getOverflow(defender) + overflow;
        }
    }

    await defender.update?.(updates);
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

    if (outcome.applied && outcome.boxes > 0) {
        await applyDamageBoxes(defender, prep.trackKey as "stun" | "physical", outcome.boxes);
    }

    if (typeof Hooks !== "undefined") {
        Hooks.callAll("actorSystemRecalculated", defender);
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
