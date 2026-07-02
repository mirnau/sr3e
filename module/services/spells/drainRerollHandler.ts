import { countSuccesses, canCurrentUserActFor } from "../combat/engine/contestCoordinator";
import { getKarmaActor, karmaBuySuccess, karmaPoolReroll, notifyKarmaSpendDeclined, type KarmaActor } from "../combat/orchestration/karmaRerollCore";
import { applyDamageBoxesFromBaseline, type HealthBaseline } from "../combat/damageApplication";
import { boxesForLevel, stageStep, type DamageStep, type DamageTrack } from "../combat/damageMath";
import { renderDrainOutcome } from "../../ui/combat/chat/renderDrainOutcome";
import { mergeMessageFlagAsGM } from "../combat/orchestration/messageRelay";
import { serializeByKey } from "../writeQueue";
import type { DieEntry } from "../../ui/combat/chat/renderRollSummary";
import type { RollSnapshot } from "../combat/engine/types";

export type MagicLossCheck = {
    rollTotal: number;
    previousMagic: number;
    newMagic: number;
    lostMagic: boolean;
    burnedOut: boolean;
};

export type DrainOutcomeFlag = {
    actorId: string;
    actorName: string;
    spellName: string;
    tn: number;
    baseLevel: DamageStep;
    track: DamageTrack;
    baseline: HealthBaseline;
    options: Record<string, unknown>;
    meta: { flavor: string; procedureKind: string };
    results: DieEntry[];
    rerollCount: number;
    magicLoss?: MagicLossCheck | null;
};

export type DrainDelta = { results: DieEntry[]; rerollCount: number };

function toRollSnapshot(flag: DrainOutcomeFlag): RollSnapshot {
    return {
        terms: [{ results: flag.results.map(r => ({ active: true, result: r.result })) }],
        options: flag.options,
        meta: flag.meta,
    };
}

export function computeDrainOutcome(flag: DrainOutcomeFlag): { successes: number; final: DamageStep | null; boxes: number } {
    const successes = countSuccesses({ ...toRollSnapshot(flag), options: { ...flag.options, targetNumber: flag.tn } });
    const final = stageStep(flag.baseLevel, -Math.floor(successes / 2));
    return { successes, final, boxes: final ? boxesForLevel(final) : 0 };
}

export function magicLossSummary(check?: MagicLossCheck | null): string {
    if (!check) return "";
    const outcome = check.lostMagic
        ? ` Magic reduced to ${check.newMagic}.${check.burnedOut ? " Burnout: Magic reached 0." : ""}`
        : " No Magic loss.";
    return `<div class="sr3e-drain-magic-loss">Magic loss check: 2D6=${check.rollTotal} vs Magic ${check.previousMagic}.${outcome}</div>`;
}

export function rerenderDrainMessage(flag: DrainOutcomeFlag): string {
    const { boxes, final } = computeDrainOutcome(flag);
    return renderDrainOutcome(
        { actorName: flag.actorName, spellName: flag.spellName, options: flag.options, meta: flag.meta, results: flag.results },
        boxes,
        flag.track,
        final,
        magicLossSummary(flag.magicLoss),
    );
}

// GM may act only when no active player controls the caster — see
// canCurrentUserActFor for why this deliberately doesn't special-case isGM.
export function canActOnDrain(flag: DrainOutcomeFlag): boolean {
    const actor = getKarmaActor(flag.actorId) as never;
    return canCurrentUserActFor(actor);
}

// Applied by whichever client actually performs the write (always the GM's —
// locally for its own action, or on socket receipt from the caster's own
// client). Merges into the message's CURRENT flag via mergeMessageFlagAsGM,
// which also serializes writes per message so overlapping recomputes can't
// clobber each other, and re-applies the health baseline from that fresh
// state rather than a client-side snapshot taken at click time.
export function applyDrainDelta(messageId: string, delta: DrainDelta, fallback: DrainOutcomeFlag): Promise<void> {
    return mergeMessageFlagAsGM<DrainOutcomeFlag>(messageId, "drainOutcome", (current) => {
        const base = current ?? fallback;
        const newFlag: DrainOutcomeFlag = { ...base, results: delta.results, rerollCount: delta.rerollCount };
        return { data: { content: rerenderDrainMessage(newFlag), "flags.sr3e.drainOutcome": newFlag } };
    });
}

function requestDrainUpdate(messageId: string, delta: DrainDelta, fallback: DrainOutcomeFlag): Promise<void> {
    if (typeof game === "undefined") return Promise.resolve();

    if ((game.user as unknown as { isGM?: boolean } | undefined)?.isGM) {
        return applyDrainDelta(messageId, delta, fallback);
    }

    (game.socket as unknown as { emit: (event: string, data: unknown) => void } | undefined)
        ?.emit("system.sr3e", { type: "drainUpdate", messageId, delta, fallback });
    return Promise.resolve();
}

// Reroll/buy only ever spend and track Karma Pool while the negotiation is
// still open — health is deliberately NOT touched here. Applying a running
// "worst case" and reimbursing it on every recompute was the source of a
// hard-to-pin-down lost-update bug (two near-simultaneous actor.update()
// calls per click). Applying health exactly once, when the player commits
// via Done, removes that whole class of bug by construction: there is only
// ever one write to the actor's health for this roll, full stop.
function applyKarmaUpdate(actor: KarmaActor, actorId: string, karmaUpdate: Record<string, unknown>): Promise<void> {
    return serializeByKey(`actor-write:${actorId}`, async () => {
        await actor.update?.(karmaUpdate, { render: false });
    });
}

export async function handleDrainReroll(messageId: string, flag: DrainOutcomeFlag): Promise<void> {
    if (!canActOnDrain(flag)) return;

    const actor = getKarmaActor(flag.actorId);
    if (!actor) return;

    const result = await karmaPoolReroll(actor, flag.results, flag.tn, flag.rerollCount);
    if (!result.ok) { notifyKarmaSpendDeclined(result.reason); return; }

    await applyKarmaUpdate(actor, flag.actorId, result.karmaUpdate);

    const delta: DrainDelta = { results: result.results, rerollCount: flag.rerollCount + 1 };
    await requestDrainUpdate(messageId, delta, flag);
}

export async function handleDrainBuy(messageId: string, flag: DrainOutcomeFlag): Promise<void> {
    if (!canActOnDrain(flag)) return;

    const actor = getKarmaActor(flag.actorId);
    if (!actor) return;

    const result = await karmaBuySuccess(actor, flag.results, flag.tn);
    if (!result.ok) { notifyKarmaSpendDeclined(result.reason); return; }

    await applyKarmaUpdate(actor, flag.actorId, result.karmaUpdate);

    const delta: DrainDelta = { results: result.results, rerollCount: flag.rerollCount };
    await requestDrainUpdate(messageId, delta, flag);
}

// Finalizes the negotiation: applies health exactly once from the baseline
// captured at the initial roll, using whatever results are currently staged
// (after any reroll/buy). The caller (chat delegation) is responsible for
// marking the message consumed so Done can't be clicked twice.
export async function handleDrainDone(flag: DrainOutcomeFlag): Promise<void> {
    if (!canActOnDrain(flag)) return;

    const actor = getKarmaActor(flag.actorId);
    if (!actor) return;

    const { boxes } = computeDrainOutcome(flag);
    await applyDamageBoxesFromBaseline(actor as never, flag.actorId, flag.baseline, flag.track, boxes);
    if (typeof Hooks !== "undefined") Hooks.callAll("actorSystemRecalculated", actor);
}
