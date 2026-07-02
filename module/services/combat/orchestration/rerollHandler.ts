import { getKarmaActor, karmaBuySuccess, karmaPoolReroll, notifyKarmaSpendDeclined, type KarmaActor } from "./karmaRerollCore";
import { serializeByKey } from "../../writeQueue";
import {
    renderSimpleRollSummary,
    renderAdvancedRollSummary,
    type DieEntry,
} from "../../../ui/combat/chat/renderRollSummary";

export type RerollFlag = {
    actorId: string;
    actorName: string;
    pipeline: "simple" | "advanced";
    options: Record<string, unknown>;
    meta: { flavor: string; procedureKind: string };
    results: DieEntry[];
    rerollCount: number;
};

type UpdatableMessage = {
    update: (data: Record<string, unknown>) => Promise<unknown>;
};

function rerenderContent(flag: RerollFlag, results: DieEntry[]): string {
    const actorRef = { name: flag.actorName };
    const rollCore = { options: flag.options, meta: flag.meta };
    return flag.pipeline === "simple"
        ? renderSimpleRollSummary(actorRef, rollCore, results)
        : renderAdvancedRollSummary(actorRef, rollCore, results);
}

function applyKarmaUpdate(actor: KarmaActor, actorId: string, karmaUpdate: Record<string, unknown>): Promise<void> {
    return serializeByKey(`actor-write:${actorId}`, async () => {
        await actor.update?.(karmaUpdate, { render: false });
    });
}

export async function handleKarmaPoolReroll(
    message: UpdatableMessage,
    flag: RerollFlag,
): Promise<void> {
    const tn = typeof flag.options.targetNumber === "number" ? flag.options.targetNumber : null;
    if (tn === null) return;

    const actor = getKarmaActor(flag.actorId);
    if (!actor) return;

    const result = await karmaPoolReroll(actor, flag.results, tn, flag.rerollCount ?? 0);
    if (!result.ok) { notifyKarmaSpendDeclined(result.reason); return; }

    await applyKarmaUpdate(actor, flag.actorId, result.karmaUpdate);

    const rerollCount = (flag.rerollCount ?? 0) + 1;
    const newFlag: RerollFlag = { ...flag, results: result.results, rerollCount };
    await message.update({ content: rerenderContent(newFlag, result.results), "flags.sr3e.reroll": newFlag });
}

export async function handleKarmaBuySuccess(
    message: UpdatableMessage,
    flag: RerollFlag,
): Promise<void> {
    const tn = typeof flag.options.targetNumber === "number" ? flag.options.targetNumber : null;
    if (tn === null) return;

    const actor = getKarmaActor(flag.actorId);
    if (!actor) return;

    const result = await karmaBuySuccess(actor, flag.results, tn);
    if (!result.ok) { notifyKarmaSpendDeclined(result.reason); return; }

    await applyKarmaUpdate(actor, flag.actorId, result.karmaUpdate);

    const newFlag: RerollFlag = { ...flag, results: result.results };
    await message.update({ content: rerenderContent(newFlag, result.results), "flags.sr3e.reroll": newFlag });
}
