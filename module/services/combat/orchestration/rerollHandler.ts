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
};

type UpdatableMessage = {
    update: (data: Record<string, unknown>) => Promise<unknown>;
};

export async function handleDieReroll(
    message: UpdatableMessage,
    dieIndex: number,
    flag: RerollFlag,
): Promise<void> {
    if (typeof game === "undefined" || !game.actors) return;

    const actor = (game.actors as any).get(flag.actorId) as any;
    if (!actor) return;

    const karmaBalance: number = actor.system?.karma?.karmaPool?.value ?? 0;
    if (karmaBalance <= 0) return;

    const tn = typeof flag.options.targetNumber === "number" ? flag.options.targetNumber : null;
    const sr3eRoll = tn !== null
        ? await SR3ERoll.build(1, tn).evaluate()
        : await SR3ERoll.buildOpen(1).evaluate();

    const dieResult = (sr3eRoll.terms[0] as any)?.results?.[0];
    const newResult: number = dieResult?.total ?? dieResult?.result ?? 1;
    const isExploded: boolean = dieResult?.exploded ?? false;

    await (game as any).dice3d?.showForRoll?.(sr3eRoll.foundryRoll, (game as any).user, true);

    const newResults = flag.results.map((entry, i) =>
        i === dieIndex ? { result: newResult, exploded: isExploded, rerolled: true } : entry,
    );

    await actor.update?.(
        { "system.karma.karmaPool.value": karmaBalance - 1 },
        { render: false },
    );

    const newFlag: RerollFlag = { ...flag, results: newResults };
    const rollCore = { options: flag.options, meta: flag.meta };
    const actorRef = { name: flag.actorName };
    const newContent = flag.pipeline === "simple"
        ? renderSimpleRollSummary(actorRef, rollCore, newResults)
        : renderAdvancedRollSummary(actorRef, rollCore, newResults);

    await message.update({ content: newContent, "flags.sr3e.reroll": newFlag });
}
