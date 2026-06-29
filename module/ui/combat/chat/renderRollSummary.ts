import type { RollSnapshot } from "../../../services/combat/engine/types";

export type DieEntry = { result: number; exploded?: boolean; rerolled?: boolean };

type DieTerm = { results?: { result: number; total?: number; active?: boolean; exploded?: boolean }[] };

type SnapshotCore = {
    options: Record<string, unknown>;
    meta: { flavor: string; procedureKind: string };
};

// ── Shared extraction ────────────────────────────────────────────────────────

export function extractDieResults(terms: unknown[]): DieEntry[] {
    return (terms as DieTerm[])
        .flatMap(t => t.results ?? [])
        .filter(r => r.active !== false)
        .map(r => ({ result: r.total ?? r.result, exploded: r.exploded }));
}

// ── Shared primitives ────────────────────────────────────────────────────────

function actorLine(actor: { name: string }, meta: { flavor: string }): string {
    return `<div class="sr3e-roll-actor">${actor.name} — ${meta.flavor}</div>`;
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

function dieSpan(entry: DieEntry, index: number, rerollable: boolean, success: boolean): string {
    let cls = "sr3e-die";
    if (success) cls += " sr3e-success";
    else if (entry.result === 1) cls += " sr3e-botch";
    if (rerollable) cls += " sr3e-rerollable";
    const mark = entry.exploded ? `<i class="fa-solid fa-explosion sr3e-exploded"></i>` : "";
    return `<span class="${cls}" data-die-index="${index}">${entry.result}${mark}</span>`;
}

function emptyDice(): string {
    return `<span class="sr3e-die">—</span>`;
}

// ── Simple roll (no TN — open test, dice pool) ───────────────────────────────

export function renderSimpleRollSummary(
    actor: { name: string },
    roll: SnapshotCore,
    results: DieEntry[],
): string {
    const isDisastrous = results.length > 0 && results.every(r => r.result === 1);

    const diceHtml = results.length > 0
        ? results.map((e, i) => dieSpan(e, i, !e.rerolled, false)).join(" ")
        : emptyDice();

    const failureLine = isDisastrous
        ? `<h5 class="sr3e-roll-failure sr3e-roll-failure--disastrous">Disastrous failure</h5>`
        : "";

    return `<div class="sr3e-roll-summary">
  ${actorLine(actor, roll.meta)}
  <div class="sr3e-roll-pool">${poolLine(roll.options)}</div>
  <div class="sr3e-roll-dice">${diceHtml}</div>
  ${failureLine}
</div>`;
}

// ── Advanced roll (with TN — skill, attribute) ───────────────────────────────

export function renderAdvancedRollSummary(
    actor: { name: string },
    roll: SnapshotCore,
    results: DieEntry[],
): string {
    const tn = roll.options.targetNumber != null ? Number(roll.options.targetNumber) : null;
    const successes = tn !== null ? results.filter(r => r.result >= tn).length : null;
    const isDisastrous = results.length > 0 && results.every(r => r.result === 1);

    const diceHtml = results.length > 0
        ? results.map((e, i) => {
            const success = tn !== null && e.result >= tn;
            return dieSpan(e, i, !e.rerolled && !success, success);
        }).join(" ")
        : emptyDice();

    const successLine = successes !== null
        ? `<div class="sr3e-roll-successes">${successes} success${successes !== 1 ? "es" : ""}</div>`
        : "";

    const failureLine = isDisastrous
        ? `<h5 class="sr3e-roll-failure sr3e-roll-failure--disastrous">Disastrous failure</h5>`
        : successes === 0 && results.length > 0
            ? `<h5 class="sr3e-roll-failure">Roll failed</h5>`
            : "";

    return `<div class="sr3e-roll-summary">
  ${actorLine(actor, roll.meta)}
  <div class="sr3e-roll-tn">${tnLine(roll.options)}</div>
  <div class="sr3e-roll-pool">${poolLine(roll.options)}</div>
  <div class="sr3e-roll-dice">${diceHtml}</div>
  ${successLine}
  ${failureLine}
</div>`;
}

// ── Legacy entry point (used by contestOutcome — always advanced) ─────────────

export function renderRollSummary(actor: { name: string }, roll: RollSnapshot): string {
    return renderAdvancedRollSummary(actor, roll, extractDieResults(roll.terms));
}
