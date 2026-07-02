export type DamageStep = "l" | "m" | "s" | "d";
export type DamageTrack = "physical" | "stun";

export const DAMAGE_STEP_LABELS: Record<DamageStep, string> = {
    l: "Light",
    m: "Moderate",
    s: "Serious",
    d: "Deadly",
};

const STEP_ORDER: DamageStep[] = ["l", "m", "s", "d"];

export function boxesForLevel(step: DamageStep): number {
    switch (step) {
        case "l": return 1;
        case "m": return 3;
        case "s": return 6;
        case "d": return 10;
    }
}

export function splitDamageType(t: string): { step: DamageStep; track: DamageTrack } {
    const track: DamageTrack = t.includes("stun") ? "stun" : "physical";
    const raw = t.replace("stun", "").trim() as DamageStep;
    const step: DamageStep = STEP_ORDER.includes(raw) ? raw : "m";
    return { step, track };
}

export function stageStep(step: DamageStep, delta: number): DamageStep | null {
    const idx = STEP_ORDER.indexOf(step) + delta;
    if (idx < 0) return null;
    if (idx >= STEP_ORDER.length) return "d";
    return STEP_ORDER[idx] ?? null;
}

export function applyAttackStaging(base: DamageStep, netSuccesses: number, extraDelta = 0): DamageStep {
    const delta = Math.floor(netSuccesses / 2) + extraDelta;
    return stageStep(base, delta) ?? "d";
}

export function applyResistanceStaging(step: DamageStep, bodySuccesses: number): DamageStep | null {
    const delta = -Math.floor(bodySuccesses / 2);
    return stageStep(step, delta);
}

export function computeResistanceTN(power: number, effectiveArmor: number, resistTNAdd = 0): number {
    return Math.max(2, power - effectiveArmor + resistTNAdd);
}
