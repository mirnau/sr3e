/**
 * Map a single-track damage degree to a SR3e penalty level.
 * - 0:   No penalty
 * - 1–2: Light   (-1)
 * - 3–5: Moderate (-2)
 * - 6–8: Serious  (-3)
 * - 9+:  Deadly   (incapacitated)
 *
 * Stun and physical are competing independent tracks — the higher of the two drives the penalty.
 * Kept independent of ElectroCardiogramService so the health penalty still computes when the
 * ECG animation is disabled and no canvas-backed service is constructed.
 */
export function calculateHealthPenalty(stun: number, physical: number): number {
	const degree = Math.max(stun, physical);
	if (degree === 0) return 0;
	if (degree < 3) return 1;
	if (degree < 6) return 2;
	if (degree < 9) return 3;
	return 4;
}
