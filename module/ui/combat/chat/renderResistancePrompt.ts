import type { ResistancePrep } from "../../../services/combat/engine/types";

const STEP_LABELS: Record<string, string> = { l: "Light", m: "Moderate", s: "Serious", d: "Deadly" };

function tnBreakdown(prep: ResistancePrep): string {
    const mods = prep.tnMods;
    if (mods.length === 0) return `TN ${prep.tnBase}`;
    const modStr = mods.map(m => `${m.name} ${m.value >= 0 ? "+" : ""}${m.value}`).join(", ");
    const final = Math.max(2, prep.tnBase + mods.reduce((s, m) => s + m.value, 0));
    return `TN ${final} (base ${prep.tnBase}, ${modStr})`;
}

export function renderResistancePrompt(
    prep: ResistancePrep,
    defender: { name: string },
    weaponName: string,
): string {
    const level = STEP_LABELS[prep.stagedStepBeforeResist] ?? prep.stagedStepBeforeResist.toUpperCase();
    const track = prep.trackKey === "stun" ? "Stun" : "Physical";

    return `<div class="sr3e-resistance-prompt">
  <div class="sr3e-resistance-header">${defender.name} — Resist ${level} ${track}</div>
  <div class="sr3e-resistance-source">from ${weaponName}</div>
  <div class="sr3e-resistance-tn">${tnBreakdown(prep)}</div>
  <button class="sr3e-resist-damage-button">Roll Resistance</button>
</div>`;
}
