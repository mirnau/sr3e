import { renderAdvancedRollSummary, type DieEntry } from "./renderRollSummary";
import type { ResistanceResult } from "../../../services/combat/resistanceEngine";
import type { ResistancePrep } from "../../../services/combat/engine/types";

const STEP_LABELS: Record<string, string> = { l: "Light", m: "Moderate", s: "Serious", d: "Deadly" };

function stepLabel(step: string | null): string {
    if (step === null) return "Staged off";
    return STEP_LABELS[step] ?? step.toUpperCase();
}

export type ResistanceRollCore = {
    actorName: string;
    options: Record<string, unknown>;
    meta: { flavor: string; procedureKind: string };
    results: DieEntry[];
};

export function renderResistanceOutcome(
    roll: ResistanceRollCore,
    outcome: ResistanceResult,
    prep: ResistancePrep,
    bodySuccesses: number,
    tn: number,
): string {
    const diceHtml = renderAdvancedRollSummary({ name: roll.actorName }, { options: roll.options, meta: roll.meta }, roll.results);
    const before = STEP_LABELS[prep.stagedStepBeforeResist] ?? prep.stagedStepBeforeResist.toUpperCase();
    const after = stepLabel(outcome.finalStep);
    const track = outcome.trackKey === "stun" ? "Stun" : "Physical";

    const resultLine = outcome.applied
        ? `<div class="sr3e-resistance-result">${roll.actorName} will take ${outcome.boxes} box${outcome.boxes !== 1 ? "es" : ""} of ${after} ${track} damage</div>`
        : `<div class="sr3e-resistance-result sr3e-resistance-success">${roll.actorName} takes no damage</div>`;

    return `<div class="sr3e-resistance-outcome">
  <div class="sr3e-resistance-header">${roll.actorName} — Resist: ${prep.weaponName}</div>
  ${diceHtml}
  <div class="sr3e-resistance-successes">${bodySuccesses} success${bodySuccesses !== 1 ? "es" : ""} vs TN ${tn}</div>
  <div class="sr3e-resistance-staging">${before} → ${after}</div>
  ${resultLine}
  <button type="button" class="sr3e-resistance-done" data-resistance-done>Done — Apply Damage</button>
</div>`;
}
