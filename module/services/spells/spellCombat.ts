import { countSuccesses } from "../combat/engine/contestCoordinator";
import { DAMAGE_STEP_LABELS, stageStep, type DamageStep } from "../combat/damageMath";
import type { ContestExport, RollSnapshot } from "../combat/engine/types";

export type SpellDamageStaging = {
    base: DamageStep;
    final: DamageStep | null;
    casterSuccesses: number;
    resistanceSuccesses: number;
    kind: "combat" | "elemental";
};

export function spellDamageStaging(
    exportCtx: ContestExport,
    casterRoll: RollSnapshot,
    resistanceRoll: RollSnapshot,
): SpellDamageStaging | null {
    const args = exportCtx.next.args;
    const base = damageStep(args.damageLevel);
    if (!base) return null;

    const category = String(args.spellCategory ?? "");
    const subtype = String(args.manipulationSubtype ?? "");
    const casterSuccesses = countSuccesses(casterRoll);
    const resistanceSuccesses = countSuccesses(resistanceRoll);

    if (category === "combat") {
        const net = Math.max(0, casterSuccesses - resistanceSuccesses);
        return { base, final: stageStep(base, Math.floor(net / 2)), casterSuccesses, resistanceSuccesses, kind: "combat" };
    }

    if (category === "manipulation" && subtype === "elemental") {
        const up = Math.floor(casterSuccesses / 2);
        const down = Math.floor(resistanceSuccesses / 2);
        return { base, final: stageStep(base, up - down), casterSuccesses, resistanceSuccesses, kind: "elemental" };
    }

    return null;
}

export function renderSpellDamageStaging(staging: SpellDamageStaging | null): string {
    if (!staging) return "";
    const base = DAMAGE_STEP_LABELS[staging.base];
    const final = staging.final ? DAMAGE_STEP_LABELS[staging.final] : "No Damage";
    const method = staging.kind === "combat"
        ? "caster net successes"
        : "caster successes vs damage resistance successes";
    return `<div class="sr3e-spell-damage">Spell damage: ${base} -> ${final} (${method})</div>`;
}

function damageStep(value: unknown): DamageStep | null {
    const step = String(value ?? "").toLowerCase() as DamageStep;
    return ["l", "m", "s", "d"].includes(step) ? step : null;
}
