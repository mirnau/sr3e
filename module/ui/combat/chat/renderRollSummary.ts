import type { RollSnapshot } from "../../../services/combat/engine/types";

export type DieEntry = { result: number; exploded?: boolean; rerolled?: boolean; bought?: boolean };

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
    const focus = Number(opts.focusDice ?? 0);
    const karma = Number(opts.karmaDice ?? 0);
    const poolKey = opts.poolKey as string | undefined;
    const focusKey = opts.focusKey as string | undefined;
    const focusLabel = opts.focusLabel as string | undefined;
    const parts = [`${base} base`];
    if (pool > 0) parts.push(`${pool} pool${poolKey ? ` (${poolKey})` : ""}`);
    if (focus > 0) parts.push(`${focus} focus${focusLabel || focusKey ? ` (${focusLabel ?? focusKey})` : ""}`);
    if (karma > 0) parts.push(`${karma} karma`);
    return `${base + pool + focus + karma} dice (${parts.join(" + ")})`;
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

function spellLine(opts: Record<string, unknown>): string {
    const spell = opts.spell as Record<string, unknown> | undefined;
    if (!spell) return "";
    const target = spell.targeting as Record<string, unknown> | undefined;
    const tags = [
        `Force ${spell.force ?? "?"}`,
        spell.type,
        spell.category,
        targetLabel(target),
        spell.exclusive ? "exclusive" : "",
        spell.fetishLimited ? "fetish" : "",
        spell.effectTag ?? "",
    ].filter(Boolean);
    return `<div class="sr3e-roll-spell">${tags.join(" · ")}</div>`;
}

function targetLabel(target?: Record<string, unknown>): string {
    if (!target) return "";
    if (target.kind === "attribute") {
        const tnSource = target.targetAttribute ?? "attribute";
        const resist = target.resistanceAttribute ?? tnSource;
        return `TN: ${tnSource}; resists: ${resist}`;
    }
    if (target.kind === "objectResistance") return `object resistance TN ${target.targetNumber ?? "?"}`;
    if (target.kind === "static") return `static TN ${target.targetNumber ?? "?"}`;
    if (target.kind === "elemental") return `elemental TN ${target.targetNumber ?? "?"}`;
    return String(target.kind ?? "");
}

function dieSpan(entry: DieEntry, index: number, rerollable: boolean, success: boolean): string {
    if (entry.bought) {
        return `<span class="sr3e-die sr3e-bought" data-die-index="${index}" title="Bought success (Karma Pool burned)"><i class="fa-solid fa-coins"></i></span>`;
    }
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

    // Always amber, rerolled or not — open rolls have no success/failure
    // verdict, so no die should ever look "resolved" differently from another.
    const diceHtml = results.length > 0
        ? results.map((e, i) => dieSpan(e, i, true, false)).join(" ")
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
    const successes = tn !== null ? results.filter(r => r.bought || r.result >= tn).length : null;
    const isDisastrous = results.length > 0 && results.every(r => r.result === 1);

    const diceHtml = results.length > 0
        ? results.map((e, i) => {
            const success = tn !== null && !e.bought && e.result >= tn;
            return dieSpan(e, i, !e.bought && !success, success);
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
  ${spellLine(roll.options)}
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
