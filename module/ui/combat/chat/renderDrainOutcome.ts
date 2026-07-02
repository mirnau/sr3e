import { renderAdvancedRollSummary, type DieEntry } from "./renderRollSummary";
import { DAMAGE_STEP_LABELS, type DamageStep, type DamageTrack } from "../../../services/combat/damageMath";

export type DrainRollCore = {
    actorName: string;
    spellName: string;
    options: Record<string, unknown>;
    meta: { flavor: string; procedureKind: string };
    results: DieEntry[];
};

function resultLine(boxes: number, track: DamageTrack): string {
    if (boxes <= 0) {
        return `<div class="sr3e-drain-result sr3e-drain-success">Your drain roll succeeded — you take no damage!</div>`;
    }
    return `<div class="sr3e-drain-result sr3e-drain-damage">Your drain roll failed — you will take ${boxes} box${boxes === 1 ? "" : "es"} of ${track} damage.</div>`;
}

export function renderDrainOutcome(
    roll: DrainRollCore,
    boxes: number,
    track: DamageTrack,
    final: DamageStep | null,
    magicLossText: string,
): string {
    const diceHtml = renderAdvancedRollSummary({ name: roll.actorName }, { options: roll.options, meta: roll.meta }, roll.results);
    const stagedLine = final
        ? `<div class="sr3e-drain-staged">Staged to: ${DAMAGE_STEP_LABELS[final]}</div>`
        : "";

    return `<div class="sr3e-drain-outcome">
  <div class="sr3e-drain-header">${roll.actorName} — Drain: ${roll.spellName}</div>
  ${diceHtml}
  ${stagedLine}
  ${resultLine(boxes, track)}
  ${magicLossText}
  <button type="button" class="sr3e-drain-done" data-drain-done>Done — Apply Damage</button>
</div>`;
}
