import { computeNetSuccesses, resolveControllingUser } from "../engine/contestCoordinator";
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
};

export type ContestOutcomeFlag = {
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

export function canActOnContestSide(side: ContestSideData): boolean {
    if (typeof game === "undefined" || !game.user) return false;
    if ((game.user as unknown as { isGM?: boolean }).isGM) return true;

    const actor = getKarmaActor(side.actorId) as never;
    const controller = actor ? resolveControllingUser(actor) : null;
    return controller?.id === (game.user as unknown as { id?: string }).id;
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
