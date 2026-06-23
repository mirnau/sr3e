import type { RollSnapshot } from "../../../services/combat/engine/types";

type DieTerm = { results?: { result: number; active?: boolean }[] };

function dieResults(terms: unknown[]): number[] {
    return (terms as DieTerm[])
        .flatMap(t => t.results ?? [])
        .filter(r => r.active !== false)
        .map(r => r.result);
}

function poolLine(opts: Record<string, unknown>): string {
    const base = Number(opts.baseDice ?? 0);
    const pool = Number(opts.poolDice ?? 0);
    const karma = Number(opts.karmaDice ?? 0);
    const parts = [`${base} base`];
    if (pool > 0) parts.push(`${pool} pool`);
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

export function renderRollSummary(actor: { name: string }, roll: RollSnapshot): string {
    const tn = roll.options.targetNumber != null ? Number(roll.options.targetNumber) : null;
    const results = dieResults(roll.terms);
    const successes = tn !== null ? results.filter(r => r >= tn).length : null;

    const diceHtml = results.length > 0
        ? results.map(r => `<span class="sr3e-die${tn !== null && r >= tn ? " sr3e-success" : ""}">${r}</span>`).join(" ")
        : "<span class=\"sr3e-die\">—</span>";

    const successLine = successes !== null
        ? `<div class="sr3e-roll-successes">${successes} success${successes !== 1 ? "es" : ""}</div>`
        : "";

    return `<div class="sr3e-roll-summary">
  <div class="sr3e-roll-actor">${actor.name} — ${roll.meta.flavor}</div>
  <div class="sr3e-roll-tn">${tnLine(roll.options)}</div>
  <div class="sr3e-roll-pool">${poolLine(roll.options)}</div>
  <div class="sr3e-roll-dice">${diceHtml}</div>
  ${successLine}
</div>`;
}
