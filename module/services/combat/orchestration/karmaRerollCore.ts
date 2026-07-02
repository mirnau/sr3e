import { SR3ERoll } from "./SR3ERoll";
import type { DieEntry } from "../../../ui/combat/chat/renderRollSummary";

export type KarmaActor = {
    system?: { karma?: { karmaPool?: { value?: number }; karmaPoolCeiling?: number } };
    update?: (data: Record<string, unknown>, opts?: Record<string, unknown>) => Promise<unknown>;
};

export type KarmaSpendDeclineReason = "insufficient-karma" | "no-failures" | "no-natural-success";

// karmaUpdate is the field-update payload the caller must apply via
// actor.update() — returned rather than written here so a caller that also
// needs to write other fields (e.g. Drain's health cascade) can merge both
// into one atomic update instead of issuing two separate writes to the same
// document, which is a real lost-update hazard, not just a theoretical one.
export type KarmaSpendResult =
    | { ok: true; results: DieEntry[]; karmaUpdate: Record<string, unknown> }
    | { ok: false; reason: KarmaSpendDeclineReason };

export function getKarmaActor(id: string): KarmaActor | null {
    if (typeof game === "undefined" || !(game as any).actors) return null;
    return ((game as any).actors as any).get(id) ?? null;
}

// Re-roll ALL currently-failed dice for (rerollCount + 1) Karma Pool points.
// Cost increments with each subsequent re-roll on the same test (SR3E p.246).
export async function karmaPoolReroll(
    actor: KarmaActor,
    results: DieEntry[],
    tn: number,
    rerollCount: number,
): Promise<KarmaSpendResult> {
    const cost = rerollCount + 1;
    const kpBalance = actor.system?.karma?.karmaPool?.value ?? 0;
    if (kpBalance < cost) return { ok: false, reason: "insufficient-karma" };

    const failures = results.filter(r => !r.bought && r.result < tn);
    if (failures.length === 0) return { ok: false, reason: "no-failures" };

    const roll = await SR3ERoll.build(failures.length, tn).evaluate();
    const dieResults: { total?: number; result?: number; exploded?: boolean }[] =
        (roll.terms[0] as any)?.results ?? [];
    await (game as any).dice3d?.showForRoll?.(roll.foundryRoll, (game as any).user, true);

    let failIdx = 0;
    const newResults = results.map(entry => {
        if (entry.bought || entry.result >= tn) return entry;
        const d = dieResults[failIdx++] ?? {};
        return { result: d.total ?? d.result ?? 1, exploded: d.exploded ?? false, rerolled: true };
    });

    return { ok: true, results: newResults, karmaUpdate: { "system.karma.karmaPool.value": kpBalance - cost } };
}

// Buy 1 additional success by burning 1 Karma Pool point permanently (SR3E p.246).
// Requires at least 1 natural (un-rerolled, un-bought) success on the roll.
export async function karmaBuySuccess(actor: KarmaActor, results: DieEntry[], tn: number): Promise<KarmaSpendResult> {
    const kpBalance = actor.system?.karma?.karmaPool?.value ?? 0;
    if (kpBalance < 1) return { ok: false, reason: "insufficient-karma" };

    const naturalSuccesses = results.filter(r => !r.rerolled && !r.bought && r.result >= tn).length;
    if (naturalSuccesses < 1) return { ok: false, reason: "no-natural-success" };

    const ceiling = actor.system?.karma?.karmaPoolCeiling ?? kpBalance;

    return {
        ok: true,
        results: [...results, { result: tn, bought: true }],
        karmaUpdate: {
            "system.karma.karmaPool.value": kpBalance - 1,
            "system.karma.karmaPoolCeiling": Math.max(0, ceiling - 1),
        },
    };
}

export function notifyKarmaSpendDeclined(reason: KarmaSpendDeclineReason): void {
    const messages: Record<KarmaSpendDeclineReason, string> = {
        "insufficient-karma": "Not enough Karma Pool.",
        "no-failures": "No failed dice to reroll.",
        "no-natural-success": "Need at least one natural success to buy another.",
    };
    (globalThis as Record<string, unknown> & { ui?: { notifications?: { warn?: (msg: string) => void } } })
        .ui?.notifications?.warn?.(messages[reason]);
}
