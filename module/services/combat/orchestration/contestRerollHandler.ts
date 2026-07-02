import { computeNetSuccesses, canCurrentUserActFor, signalContestBothDone } from "../engine/contestCoordinator";
import { getKarmaActor, karmaBuySuccess, karmaPoolReroll, notifyKarmaSpendDeclined, type KarmaActor } from "./karmaRerollCore";
import { spellDamageStaging, renderSpellDamageStaging } from "../../spells/spellCombat";
import { renderContestOutcome } from "../../../ui/combat/chat/renderContestOutcome";
import { mergeMessageFlagAsGM } from "./messageRelay";
import { serializeByKey } from "../../writeQueue";
import type { DieEntry } from "../../../ui/combat/chat/renderRollSummary";
import type { ContestExport, RollSnapshot } from "../engine/types";

export type ContestSide = "initiator" | "target";

export type ContestSideData = {
    actorId: string;
    actorName: string;
    options: Record<string, unknown>;
    meta: { flavor: string; procedureKind: string };
    results: DieEntry[];
    rerollCount: number;
    done: boolean;
};

export type ContestOutcomeFlag = {
    contestId: string;
    weaponName: string;
    exportCtx: ContestExport;
    initiator: ContestSideData;
    target: ContestSideData;
};

export type ContestSideDelta = { side: ContestSide; results: DieEntry[]; rerollCount: number };

function toRollSnapshot(side: ContestSideData): RollSnapshot {
    return {
        terms: [{ results: side.results.map(r => ({ active: true, result: r.result })) }],
        options: side.options,
        meta: side.meta,
    };
}

// Deliberately allows GM action only when resolveControllingUser falls back
// to the GM (no active player controls this side's actor) — a GM must NOT
// be able to act on behalf of a player who is actively at the keyboard.
export function canActOnContestSide(side: ContestSideData): boolean {
    if (side.done) return false;
    const actor = getKarmaActor(side.actorId) as never;
    return canCurrentUserActFor(actor);
}

// The message's FINAL negotiated net successes — computed the same way
// rerenderContestMessage does, for use once both sides are done and the
// caller needs to know who actually won after any reroll/buy.
export function computeFinalNetSuccesses(flag: ContestOutcomeFlag): number {
    return computeNetSuccesses(toRollSnapshot(flag.initiator), toRollSnapshot(flag.target));
}

export function rerenderContestMessage(flag: ContestOutcomeFlag): string {
    const initiatorRoll = toRollSnapshot(flag.initiator);
    const targetRoll = toRollSnapshot(flag.target);
    const staging = spellDamageStaging(flag.exportCtx, initiatorRoll, targetRoll);

    return renderContestOutcome({
        initiator: { name: flag.initiator.actorName },
        target: { name: flag.target.actorName },
        weaponName: flag.weaponName,
        initiatorRoll,
        targetRoll,
        initiatorResults: flag.initiator.results,
        targetResults: flag.target.results,
        initiatorDone: flag.initiator.done,
        targetDone: flag.target.done,
        netSuccesses: computeNetSuccesses(initiatorRoll, targetRoll),
        extraHtml: renderSpellDamageStaging(staging),
    });
}

// Applied by whichever client actually performs the write (always the GM's —
// either locally for its own action, or on receipt of a relayed socket
// message from the other participant). Merges the delta into the message's
// CURRENT flag, not a client-side snapshot taken at click time, so a
// same-side second click or a concurrent write for the other side can never
// clobber each other — mergeMessageFlagAsGM also serializes this per message.
export function applyContestSideDelta(
    messageId: string,
    delta: ContestSideDelta,
    fallback: ContestOutcomeFlag,
): Promise<void> {
    return mergeMessageFlagAsGM<ContestOutcomeFlag>(messageId, "contestOutcome", (current) => {
        const base = current ?? fallback;
        const newSide: ContestSideData = { ...base[delta.side], results: delta.results, rerollCount: delta.rerollCount };
        const newFlag: ContestOutcomeFlag = { ...base, [delta.side]: newSide };
        return { data: { content: rerenderContestMessage(newFlag), "flags.sr3e.contestOutcome": newFlag } };
    });
}

// Marks one side done. Once both sides are done, disables the whole card
// (reusing the existing `consumed` auto-disable) and signals whichever
// client is blocked inside executeContestedFlow's waitForBothDone, carrying
// the final flag so that client never needs to re-read game.messages itself
// (which would race against Foundry's own document-update broadcast).
// The signal is fired only after the write actually completes — signalling
// from inside the merge callback would fire before the update() call even
// starts, well before it's visible to any other client.
export async function applyContestDone(
    messageId: string,
    side: ContestSide,
    fallback: ContestOutcomeFlag,
): Promise<void> {
    const state: { flag: ContestOutcomeFlag | null } = { flag: null };

    await mergeMessageFlagAsGM<ContestOutcomeFlag>(messageId, "contestOutcome", (current) => {
        const base = current ?? fallback;
        const newSide: ContestSideData = { ...base[side], done: true };
        const newFlag: ContestOutcomeFlag = { ...base, [side]: newSide };
        const bothDone = newFlag.initiator.done && newFlag.target.done;

        const data: Record<string, unknown> = {
            content: rerenderContestMessage(newFlag),
            "flags.sr3e.contestOutcome": newFlag,
        };
        if (bothDone) {
            data["flags.sr3e.consumed"] = true;
            state.flag = newFlag;
        }
        return { data };
    });

    if (state.flag) signalContestBothDone(state.flag.contestId, state.flag);
}

function requestContestDoneUpdate(messageId: string, side: ContestSide, fallback: ContestOutcomeFlag): Promise<void> {
    if (typeof game === "undefined") return Promise.resolve();

    if ((game.user as unknown as { isGM?: boolean } | undefined)?.isGM) {
        return applyContestDone(messageId, side, fallback);
    }

    (game.socket as unknown as { emit: (event: string, data: unknown) => void } | undefined)
        ?.emit("system.sr3e", { type: "contestDone", messageId, side, fallback });
    return Promise.resolve();
}

export async function handleContestDone(messageId: string, flag: ContestOutcomeFlag, side: ContestSide): Promise<void> {
    if (!canActOnContestSide(flag[side])) return;
    await requestContestDoneUpdate(messageId, side, flag);
}

function applyKarmaUpdate(actor: KarmaActor, actorId: string, karmaUpdate: Record<string, unknown>): Promise<void> {
    return serializeByKey(`actor-write:${actorId}`, async () => {
        await actor.update?.(karmaUpdate, { render: false });
    });
}

function requestContestSideUpdate(messageId: string, delta: ContestSideDelta, fallback: ContestOutcomeFlag): Promise<void> {
    if (typeof game === "undefined") return Promise.resolve();

    if ((game.user as unknown as { isGM?: boolean } | undefined)?.isGM) {
        return applyContestSideDelta(messageId, delta, fallback);
    }

    (game.socket as unknown as { emit: (event: string, data: unknown) => void } | undefined)
        ?.emit("system.sr3e", { type: "contestSideUpdate", messageId, delta, fallback });
    return Promise.resolve();
}

export async function handleContestReroll(messageId: string, flag: ContestOutcomeFlag, side: ContestSide): Promise<void> {
    const sideData = flag[side];
    if (!canActOnContestSide(sideData)) return;

    const tn = typeof sideData.options.targetNumber === "number" ? sideData.options.targetNumber : null;
    if (tn === null) return;

    const actor = getKarmaActor(sideData.actorId);
    if (!actor) return;

    const result = await karmaPoolReroll(actor, sideData.results, tn, sideData.rerollCount);
    if (!result.ok) { notifyKarmaSpendDeclined(result.reason); return; }

    await applyKarmaUpdate(actor, sideData.actorId, result.karmaUpdate);
    await requestContestSideUpdate(messageId, { side, results: result.results, rerollCount: sideData.rerollCount + 1 }, flag);
}

export async function handleContestBuy(messageId: string, flag: ContestOutcomeFlag, side: ContestSide): Promise<void> {
    const sideData = flag[side];
    if (!canActOnContestSide(sideData)) return;

    const tn = typeof sideData.options.targetNumber === "number" ? sideData.options.targetNumber : null;
    if (tn === null) return;

    const actor = getKarmaActor(sideData.actorId);
    if (!actor) return;

    const result = await karmaBuySuccess(actor, sideData.results, tn);
    if (!result.ok) { notifyKarmaSpendDeclined(result.reason); return; }

    await applyKarmaUpdate(actor, sideData.actorId, result.karmaUpdate);
    await requestContestSideUpdate(messageId, { side, results: result.results, rerollCount: sideData.rerollCount }, flag);
}
