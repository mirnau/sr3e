import type { RollSnapshot } from "../../../services/combat/engine/types";

export type DieEntry = { result: number; exploded?: boolean; rerolled?: boolean };

type DieTerm = { results?: { result: number; active?: boolean; exploded?: boolean }[] };

type SnapshotCore = {
    options: Record<string, unknown>;
    meta: { flavor: string; procedureKind: string };
};

export function extractDieResults(terms: unknown[]): DieEntry[] {
    return (terms as DieTerm[])
        .flatMap(t => t.results ?? [])
        .filter(r => r.active !== false)
        .map(r => ({ result: r.result, exploded: r.exploded }));
}

function poolLine(opts: Record<string, unknown>): string {
    const base = Number(opts.baseDice ?? 0);
    const pool = Number(opts.poolDice ?? 0);
    const karma = Number(opts.karmaDice ?? 0);
    const poolKey = opts.poolKey as string | undefined;
    const parts = [`${base} base`];
    if (pool > 0) parts.push(`${pool} pool${poolKey ? ` (${poolKey})` : ""}`);
    if (karma > 0) parts.push(`${karma} karma`);
    return `${base + pool + karma} dice (${parts.join(" + ")})`;
}

function tnLine(opts: Record<string, unknown>): string {
    const final = opts.targetNumber != null ? Number(opts.targetNumber) : null;
    if (final === null) return "open roll";
    const base = Number(opts.tnBase ?? final);
    const mods = (opts.tnMods as { name: string; value: number }[] | undefined) ?? [];
    const modStr = mods.length > 0
        ? ` (base ${base}, mods: ${mods.map(m => `${m.name} ${m.value >= 0 ? "+" : ""}${m.value}`).join(", ")})`
        : "";
    return `TN ${final}${base !== final ? modStr : ""}`;
}

export function renderRollSummaryFromResults(
    actor: { name: string },
    roll: SnapshotCore,
    results: DieEntry[],
): string {
    const tn = roll.options.targetNumber != null ? Number(roll.options.targetNumber) : null;
    const successes = tn !== null ? results.filter(r => r.result >= tn).length : null;

    const isDisastrous = results.length > 0 && results.every(r => r.result === 1);

    const diceHtml = results.length > 0
        ? results.map(({ result, exploded, rerolled }, i) => {
            const success = tn !== null && result >= tn;
            const rerollable = !rerolled && (tn === null || !success);
            let cls = "sr3e-die";
            if (success) cls += " sr3e-success";
            else if (result === 1) cls += " sr3e-botch";
            if (rerollable) cls += " sr3e-rerollable";
            const mark = exploded ? `<i class="fa-solid fa-explosion sr3e-exploded"></i>` : "";
            return `<span class="${cls}" data-die-index="${i}">${result}${mark}</span>`;
        }).join(" ")
        : `<span class="sr3e-die">—</span>`;

    const successLine = successes !== null
        ? `<div class="sr3e-roll-successes">${successes} success${successes !== 1 ? "es" : ""}</div>`
        : "";

    const failureLine = isDisastrous
        ? `<h5 class="sr3e-roll-failure sr3e-roll-failure--disastrous">Disastrous failure</h5>`
        : tn !== null && successes === 0 && results.length > 0
            ? `<h5 class="sr3e-roll-failure">Roll failed</h5>`
            : "";

    return `<div class="sr3e-roll-summary">
  <div class="sr3e-roll-actor">${actor.name} — ${roll.meta.flavor}</div>
  <div class="sr3e-roll-tn">${tnLine(roll.options)}</div>
  <div class="sr3e-roll-pool">${poolLine(roll.options)}</div>
  <div class="sr3e-roll-dice">${diceHtml}</div>
  ${successLine}
  ${failureLine}
</div>`;
}

export function renderRollSummary(actor: { name: string }, roll: RollSnapshot): string {
    return renderRollSummaryFromResults(actor, roll, extractDieResults(roll.terms));
}
