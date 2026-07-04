import type { Modifier } from "./modifierList";

export type ManeuverScoreRollKind = "accelBrakeRam" | "hiding" | "gunnery";

// SR3 p.141/144/153 — the only thing that matters is the *gap* between the
// two Maneuver Scores, not either score's absolute value. Hiding is
// asymmetric (worse penalty when losing than the bonus for winning);
// Gunnery only cares about gaps bigger than 10.
const RULES: Record<ManeuverScoreRollKind, { favorSmall: number; favorLarge: number; againstSmall: number; againstLarge: number }> = {
    accelBrakeRam: { favorSmall: -2, favorLarge: -4, againstSmall: 2, againstLarge: 4 },
    hiding: { favorSmall: -2, favorLarge: -4, againstSmall: 3, againstLarge: 6 },
    gunnery: { favorSmall: 0, favorLarge: -1, againstSmall: 0, againstLarge: 1 },
};

// A visible named modifier, never a silent change to the base TN — GM/code
// convention is the same one already used for the VCR TN reduction.
// opposingScore of null (the field left blank) is treated as "assumed
// equal" per direction, i.e. no modifier.
export function maneuverScoreComparisonModifier(
    myScore: number,
    opposingScore: number | null,
    kind: ManeuverScoreRollKind,
): Modifier[] {
    const opposing = opposingScore ?? myScore;
    const diff = myScore - opposing;
    if (diff === 0) return [];

    const rule = RULES[kind];
    const bigGap = Math.abs(diff) > 10;
    const value = diff > 0
        ? (bigGap ? rule.favorLarge : rule.favorSmall)
        : (bigGap ? rule.againstLarge : rule.againstSmall);
    if (value === 0) return [];

    return [{ id: "maneuver-score-comparison", name: "Maneuver Score", value }];
}
