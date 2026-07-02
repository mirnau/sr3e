import { countSuccesses, resolveControllingUser } from "../engine/contestCoordinator";
import { getKarmaActor, karmaBuySuccess, karmaPoolReroll, notifyKarmaSpendDeclined, type KarmaActor } from "./karmaRerollCore";
import { applyDamageBoxesFromBaseline, type HealthBaseline } from "../damageApplication";
import { resolveResistance, type ResistanceBuild, type ResistanceResult } from "../resistanceEngine";
import { renderResistanceOutcome } from "../../../ui/combat/chat/renderResistanceOutcome";
import { mergeMessageFlagAsGM } from "./messageRelay";
import { serializeByKey } from "../../writeQueue";
import type { DieEntry } from "../../../ui/combat/chat/renderRollSummary";
import type { ResistancePrep, RollSnapshot } from "../engine/types";

export type ResistanceOutcomeFlag = {
    actorId: string;
    actorName: string;
    prep: ResistancePrep;
    build: ResistanceBuild;
    baseline: HealthBaseline;
    options: Record<string, unknown>;
    meta: { flavor: string; procedureKind: string };
    results: DieEntry[];
    rerollCount: number;
};

export type ResistanceDelta = { results: DieEntry[]; rerollCount: number };

function toRollSnapshot(flag: ResistanceOutcomeFlag): RollSnapshot {
    return {
        terms: [{ results: flag.results.map(r => ({ active: true, result: r.result })) }],
        options: flag.options,
        meta: flag.meta,
    };
}

export function computeResistanceOutcome(flag: ResistanceOutcomeFlag): { successes: number; outcome: ResistanceResult } {
    const successes = countSuccesses({ ...toRollSnapshot(flag), options: { ...flag.options, targetNumber: flag.build.tn } });
    return { successes, outcome: resolveResistance(flag.build, successes) };
}

export function rerenderResistanceMessage(flag: ResistanceOutcomeFlag): string {
    const { successes, outcome } = computeResistanceOutcome(flag);
    return renderResistanceOutcome(
        { actorName: flag.actorName, options: flag.options, meta: flag.meta, results: flag.results },
        outcome,
        flag.prep,
        successes,
        flag.build.tn,
    );
}

export function canActOnResistance(flag: ResistanceOutcomeFlag): boolean {
    if (typeof game === "undefined" || !game.user) return false;
    if ((game.user as unknown as { isGM?: boolean }).isGM) return true;

    const actor = getKarmaActor(flag.actorId) as never;
    const controller = actor ? resolveControllingUser(actor) : null;
    return controller?.id === (game.user as unknown as { id?: string }).id;
}

// Applied by whichever client actually performs the write (always the GM's —
// locally for its own action, or on socket receipt from the defender's own
// client). Merges into the message's CURRENT flag via mergeMessageFlagAsGM,
// which also serializes writes per message so overlapping recomputes can't
// clobber each other.
export function applyResistanceDelta(
    messageId: string,
    delta: ResistanceDelta,
    fallback: ResistanceOutcomeFlag,
): Promise<void> {
    return mergeMessageFlagAsGM<ResistanceOutcomeFlag>(messageId, "resistanceOutcome", (current) => {
        const base = current ?? fallback;
        const newFlag: ResistanceOutcomeFlag = { ...base, results: delta.results, rerollCount: delta.rerollCount };
        return { data: { content: rerenderResistanceMessage(newFlag), "flags.sr3e.resistanceOutcome": newFlag } };
    });
}

function requestResistanceUpdate(messageId: string, delta: ResistanceDelta, fallback: ResistanceOutcomeFlag): Promise<void> {
    if (typeof game === "undefined") return Promise.resolve();

    if ((game.user as unknown as { isGM?: boolean } | undefined)?.isGM) {
        return applyResistanceDelta(messageId, delta, fallback);
    }

    (game.socket as unknown as { emit: (event: string, data: unknown) => void } | undefined)
        ?.emit("system.sr3e", { type: "resistanceUpdate", messageId, delta, fallback });
    return Promise.resolve();
}

// Reroll/buy only ever spend and track Karma Pool while the negotiation is
// still open — health is deliberately NOT touched here, same reasoning as
// Drain: applying a running "worst case" and reimbursing it on every
// recompute was the source of a hard-to-pin-down lost-update bug. Applying
// health exactly once, when the player commits via Done, removes that whole
// class of bug by construction.
function applyKarmaUpdate(actor: KarmaActor, actorId: string, karmaUpdate: Record<string, unknown>): Promise<void> {
    return serializeByKey(`actor-write:${actorId}`, async () => {
        await actor.update?.(karmaUpdate, { render: false });
    });
}

export async function handleResistanceReroll(messageId: string, flag: ResistanceOutcomeFlag): Promise<void> {
    if (!canActOnResistance(flag)) return;

    const actor = getKarmaActor(flag.actorId);
    if (!actor) return;

    const result = await karmaPoolReroll(actor, flag.results, flag.build.tn, flag.rerollCount);
    if (!result.ok) { notifyKarmaSpendDeclined(result.reason); return; }

    await applyKarmaUpdate(actor, flag.actorId, result.karmaUpdate);

    const delta: ResistanceDelta = { results: result.results, rerollCount: flag.rerollCount + 1 };
    await requestResistanceUpdate(messageId, delta, flag);
}

export async function handleResistanceBuy(messageId: string, flag: ResistanceOutcomeFlag): Promise<void> {
    if (!canActOnResistance(flag)) return;

    const actor = getKarmaActor(flag.actorId);
    if (!actor) return;

    const result = await karmaBuySuccess(actor, flag.results, flag.build.tn);
    if (!result.ok) { notifyKarmaSpendDeclined(result.reason); return; }

    await applyKarmaUpdate(actor, flag.actorId, result.karmaUpdate);

    const delta: ResistanceDelta = { results: result.results, rerollCount: flag.rerollCount };
    await requestResistanceUpdate(messageId, delta, flag);
}

// Finalizes the negotiation: applies health exactly once from the baseline
// captured at the initial roll, using whatever results are currently staged
// (after any reroll/buy). The caller (chat delegation) is responsible for
// marking the message consumed so Done can't be clicked twice.
export async function handleResistanceDone(flag: ResistanceOutcomeFlag): Promise<void> {
    if (!canActOnResistance(flag)) return;

    const actor = getKarmaActor(flag.actorId);
    if (!actor) return;

    const { outcome } = computeResistanceOutcome(flag);
    if (outcome.applied && outcome.boxes > 0) {
        await applyDamageBoxesFromBaseline(actor as never, flag.actorId, flag.baseline, outcome.trackKey, outcome.boxes);
    }
    if (typeof Hooks !== "undefined") Hooks.callAll("actorSystemRecalculated", actor);
}
