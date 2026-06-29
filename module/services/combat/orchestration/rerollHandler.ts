import { SR3ERoll } from "./SR3ERoll";
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

function getActor(id: string): Record<string, unknown> | null {
    if (typeof game === "undefined" || !(game as any).actors) return null;
    return ((game as any).actors as any).get(id) ?? null;
}

function rerenderContent(flag: RerollFlag, results: DieEntry[]): string {
    const actorRef = { name: flag.actorName };
    const rollCore = { options: flag.options, meta: flag.meta };
    return flag.pipeline === "simple"
        ? renderSimpleRollSummary(actorRef, rollCore, results)
        : renderAdvancedRollSummary(actorRef, rollCore, results);
}

// Re-roll ALL currently-failed dice for (rerollCount + 1) Karma Pool points.
// Cost increments with each subsequent re-roll on the same test (SR3E p.246).
export async function handleKarmaPoolReroll(
    message: UpdatableMessage,
    flag: RerollFlag,
): Promise<void> {
    const tn = typeof flag.options.targetNumber === "number" ? flag.options.targetNumber : null;
    if (tn === null) return;

    const actor = getActor(flag.actorId) as any;
    if (!actor) return;

    const cost = (flag.rerollCount ?? 0) + 1;
    const kpBalance: number = actor.system?.karma?.karmaPool?.value ?? 0;
    if (kpBalance < cost) return;

    const failures = flag.results.filter(r => !r.bought && r.result < tn);
    if (failures.length === 0) return;

    const roll = await SR3ERoll.build(failures.length, tn).evaluate();
    const dieResults: { total?: number; result?: number; exploded?: boolean }[] =
        (roll.terms[0] as any)?.results ?? [];
    await (game as any).dice3d?.showForRoll?.(roll.foundryRoll, (game as any).user, true);

    let failIdx = 0;
    const newResults = flag.results.map(entry => {
        if (entry.bought || entry.result >= tn) return entry;
        const d = dieResults[failIdx++] ?? {};
        return { result: d.total ?? d.result ?? 1, exploded: d.exploded ?? false, rerolled: true };
    });

    await actor.update?.({ "system.karma.karmaPool.value": kpBalance - cost }, { render: false });

    const rerollCount = (flag.rerollCount ?? 0) + 1;
    const newFlag: RerollFlag = { ...flag, results: newResults, rerollCount };
    await message.update({ content: rerenderContent(newFlag, newResults), "flags.sr3e.reroll": newFlag });
}

// Buy 1 additional success by burning 1 Karma Pool point permanently (SR3E p.246).
// Requires at least 1 natural (un-rerolled, un-bought) success on the roll.
export async function handleKarmaBuySuccess(
    message: UpdatableMessage,
    flag: RerollFlag,
): Promise<void> {
    const tn = typeof flag.options.targetNumber === "number" ? flag.options.targetNumber : null;
    if (tn === null) return;

    const actor = getActor(flag.actorId) as any;
    if (!actor) return;

    const kpBalance: number = actor.system?.karma?.karmaPool?.value ?? 0;
    if (kpBalance < 1) return;

    const naturalSuccesses = flag.results.filter(r => !r.rerolled && !r.bought && r.result >= tn).length;
    if (naturalSuccesses < 1) return;

    const ceiling: number = actor.system?.karma?.karmaPoolCeiling ?? kpBalance;
    await actor.update?.({
        "system.karma.karmaPool.value": kpBalance - 1,
        "system.karma.karmaPoolCeiling": Math.max(0, ceiling - 1),
    }, { render: false });

    const newResults: DieEntry[] = [...flag.results, { result: tn, bought: true }];
    const newFlag: RerollFlag = { ...flag, results: newResults };
    await message.update({ content: rerenderContent(newFlag, newResults), "flags.sr3e.reroll": newFlag });
}
