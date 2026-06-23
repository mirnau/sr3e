import type { ResistanceResult } from "../../../services/combat/resistanceEngine";
import type { ResistancePrep } from "../../../services/combat/engine/types";

const STEP_LABELS: Record<string, string> = { l: "Light", m: "Moderate", s: "Serious", d: "Deadly" };

function stepLabel(step: string | null): string {
    if (step === null) return "Staged off";
    return STEP_LABELS[step] ?? step.toUpperCase();
}

export function renderResistanceOutcome(
    outcome: ResistanceResult,
    prep: ResistancePrep,
    bodySuccesses: number,
    tn: number,
    overflowBoxes = 0,
): string {
    const before = STEP_LABELS[prep.stagedStepBeforeResist] ?? prep.stagedStepBeforeResist.toUpperCase();
    const after = stepLabel(outcome.finalStep);
    const track = prep.trackKey === "stun" ? "Stun" : "Physical";

    const resultLine = outcome.applied
        ? `${outcome.boxes} box${outcome.boxes !== 1 ? "es" : ""} to ${track}`
        : "Damage staged off — no boxes applied";

    const overflowLine = overflowBoxes > 0
        ? `<div class="sr3e-overflow">Overflow: ${overflowBoxes} box${overflowBoxes !== 1 ? "es" : ""} to Physical</div>`
        : "";

    return `<div class="sr3e-resistance-outcome">
  <div class="sr3e-resistance-successes">${bodySuccesses} success${bodySuccesses !== 1 ? "es" : ""} vs TN ${tn}</div>
  <div class="sr3e-resistance-staging">${before} → ${after}</div>
  <div class="sr3e-resistance-result">${resultLine}</div>
  ${overflowLine}
</div>`;
}
