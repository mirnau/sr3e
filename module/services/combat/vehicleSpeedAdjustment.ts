// SR3 p.142 — Change in Speed = Acceleration Rating x successes. Applies
// incrementally against whatever speed the vehicle actually has right now
// (not a recompute from a remembered baseline) so it composes correctly
// with anything else that touched currentSpeed in between — a later karma
// reroll/bought success on this same roll only needs to apply its own
// *marginal* extra successes, not replay the whole roll from scratch.
export type VehicleSpeedAdjustmentDirection = "accelerate" | "brake";

export function applySpeedDelta(
    currentSpeed: number,
    accel: number,
    extraSuccesses: number,
    direction: VehicleSpeedAdjustmentDirection,
    maxSpeed: number,
): number {
    const delta = extraSuccesses * accel * (direction === "accelerate" ? 1 : -1);
    const ceiling = maxSpeed > 0 ? maxSpeed : Infinity;
    return Math.max(0, Math.min(ceiling, currentSpeed + delta));
}
