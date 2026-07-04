// Existing success-counters in this codebase are inconsistent: contestCoordinator's
// countSuccesses compares raw `.result` (the last face rolled), which is
// wrong for exploding dice — SR3Edie's accumulation puts the Rule-of-Six
// chain total in `.total`, matching what renderRollSummary.ts uses for the
// chat display. This counts against `.total` so it agrees with what the
// player actually sees rolled.
type DieResultLike = { result?: number; total?: number; active?: boolean };
type DieTermLike = { results?: DieResultLike[] };

export function countTnSuccesses(terms: unknown[], targetNumber: number): number {
    const dieTerm = (terms as DieTermLike[]).find((t) => Array.isArray(t?.results));
    return (dieTerm?.results ?? [])
        .filter((r) => r.active !== false && (r.total ?? r.result ?? 0) >= targetNumber)
        .length;
}
