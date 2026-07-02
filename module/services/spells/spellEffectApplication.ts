import { countSuccesses } from "../combat/engine/contestCoordinator";
import type { RollSnapshot } from "../combat/engine/types";
import { computeEffectMagnitude, type EffectAlgorithmKey } from "./spellEffectMagnitude";
import { attachSustainedEffect, type EffectTargetActor } from "./sustainedSpells";

export type SpellEffectConfig = {
    algorithm?: string;
    targetPath?: string;
    scope?: string;
};

type ActorLike = EffectTargetActor & {
    getFlag?: (scope: string, key: string) => unknown;
    setFlag?: (scope: string, key: string, value: unknown) => Promise<unknown>;
};

const AUTO_APPLIED_ALGORITHM: EffectAlgorithmKey = "attributeModPerTwo";

const CHAT_TAG_LABELS: Partial<Record<EffectAlgorithmKey, string>> = {
    tnPerSuccess: "TN Modifier",
    tnPerSuccessCapped8: "TN Modifier",
    tnPerTwoSuccesses: "TN Modifier",
    barrierStep: "Barrier Rating",
    levitateSpeed: "Levitate Speed (m/Combat Turn)",
    magicFingers: "Magic Fingers (Str/Qui)",
    detectionRange: "Detection Range (m)",
    permanentTimeDivisor: "Casting Time (Combat Turns)",
};

function rollSuccesses(roll: unknown, targetNumber: number): number {
    const snapshot = roll as RollSnapshot;
    return countSuccesses({ ...snapshot, options: { ...snapshot?.options, targetNumber } });
}

export async function applySustainedSpellEffect(
    actor: ActorLike,
    sustainedId: string,
    effect: SpellEffectConfig,
    roll: unknown,
    targetNumber: number,
    force: number,
    spellName: string,
): Promise<void> {
    if (effect.algorithm !== AUTO_APPLIED_ALGORITHM || !effect.targetPath) return;

    const successes = rollSuccesses(roll, targetNumber);
    const magnitude = computeEffectMagnitude(AUTO_APPLIED_ALGORITHM, { force, successes, magic: 0 });

    const targetActor = resolveScopeActor(actor, effect.scope);
    if (!targetActor) return;

    await attachSustainedEffect(actor, targetActor, sustainedId, effect.targetPath, magnitude, `${spellName} (Sustained)`);
}

export function computeEffectChatTag(
    effect: SpellEffectConfig,
    roll: unknown,
    targetNumber: number,
    force: number,
    magic: number,
    baseTimeTurns: number,
): string | null {
    const key = effect.algorithm as EffectAlgorithmKey;
    const label = key ? CHAT_TAG_LABELS[key] : undefined;
    if (!label) return null;

    const successes = rollSuccesses(roll, targetNumber);
    const magnitude = computeEffectMagnitude(key, { force, successes, magic, baseTimeTurns });
    return `${label}: ${magnitude}`;
}

function resolveScopeActor(actor: ActorLike, scope: string | undefined): ActorLike | null {
    if (scope !== "target") return actor;
    const targets = typeof game !== "undefined" ? [...((game.user as any)?.targets ?? [])] : [];
    if (targets.length !== 1) return null;
    return ((targets[0] as any)?.actor as ActorLike | undefined) ?? null;
}
