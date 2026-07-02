import { serializeByKey } from "../writeQueue";

export type DamageTrackKey = "stun" | "physical";

export type DamagedActor = {
    system: Record<string, unknown>;
    update?: (data: Record<string, unknown>) => Promise<unknown>;
};

export type HealthBaseline = { stun: number; physical: number; overflow: number };

const TRACK_MAX = 10;

type HealthSystem = {
    stun?: { value?: number };
    physical?: { value?: number };
    overflow?: { value?: number };
};

export function getTrackValue(actor: DamagedActor, track: DamageTrackKey): number {
    const h = (actor.system as { health?: HealthSystem }).health ?? {};
    return h[track]?.value ?? 0;
}

export function getOverflow(actor: DamagedActor): number {
    const h = (actor.system as { health?: HealthSystem }).health ?? {};
    return h.overflow?.value ?? 0;
}

export function captureHealthBaseline(actor: DamagedActor): HealthBaseline {
    return { stun: getTrackValue(actor, "stun"), physical: getTrackValue(actor, "physical"), overflow: getOverflow(actor) };
}

function cascadeFromTrack(track: DamageTrackKey, startValue: number, boxes: number, physicalStart: number, overflowStart: number) {
    const newValue = Math.min(startValue + boxes, TRACK_MAX);
    const spill = Math.max(0, startValue + boxes - TRACK_MAX);

    const updates: Record<string, unknown> = { [`system.health.${track}.value`]: newValue };

    if (spill <= 0) return updates;

    if (track === "stun") {
        const newPhys = Math.min(physicalStart + spill, TRACK_MAX);
        const physSpill = Math.max(0, physicalStart + spill - TRACK_MAX);
        updates["system.health.physical.value"] = newPhys;
        if (physSpill > 0) updates["system.health.overflow.value"] = overflowStart + physSpill;
    } else {
        updates["system.health.overflow.value"] = overflowStart + spill;
    }

    return updates;
}

// Incremental: adds `boxes` on top of the actor's current value. For one-shot
// damage application where nothing will be recomputed afterward.
export async function applyDamageBoxes(actor: DamagedActor, actorKey: string, track: DamageTrackKey, boxes: number): Promise<void> {
    if (boxes <= 0) return;
    await serializeByKey(`actor-write:${actorKey}`, async () => {
        const updates = cascadeFromTrack(track, getTrackValue(actor, track), boxes, getTrackValue(actor, "physical"), getOverflow(actor));
        await actor.update?.(updates);
    });
}

// Baseline-relative, pure: computes the field-update payload as if
// `totalBoxes` were applied fresh on top of `baseline`, not the actor's
// current (possibly already-adjusted) value. Safe to call repeatedly as a
// roll gets rerolled/bought — each call recomputes the full cascade from the
// same fixed starting point and explicitly sets every field it owns (even
// back to baseline when there's no spill), so a reroll that reduces total
// boxes correctly gives health back instead of drifting from a prior call's
// spill. Returns data rather than writing it so a caller that also needs to
// write other fields in the same beat (e.g. a karma-pool deduction) can
// merge both into one atomic actor.update() — two separate near-simultaneous
// writes to the same document is a real lost-update hazard.
export function computeDamageBoxesFromBaseline(
    baseline: HealthBaseline,
    track: DamageTrackKey,
    totalBoxes: number,
): Record<string, unknown> {
    if (track === "stun") {
        const stunValue = Math.min(baseline.stun + totalBoxes, TRACK_MAX);
        const stunSpill = Math.max(0, baseline.stun + totalBoxes - TRACK_MAX);
        const physValue = Math.min(baseline.physical + stunSpill, TRACK_MAX);
        const physSpill = Math.max(0, baseline.physical + stunSpill - TRACK_MAX);

        return {
            "system.health.stun.value": stunValue,
            "system.health.physical.value": physValue,
            "system.health.overflow.value": baseline.overflow + physSpill,
        };
    }

    const physValue = Math.min(baseline.physical + totalBoxes, TRACK_MAX);
    const physSpill = Math.max(0, baseline.physical + totalBoxes - TRACK_MAX);

    return {
        "system.health.physical.value": physValue,
        "system.health.overflow.value": baseline.overflow + physSpill,
    };
}

// Self-contained variant for callers with nothing else to write in the same
// beat: computes and writes in one serialized step.
export async function applyDamageBoxesFromBaseline(
    actor: DamagedActor,
    actorKey: string,
    baseline: HealthBaseline,
    track: DamageTrackKey,
    totalBoxes: number,
): Promise<void> {
    await serializeByKey(`actor-write:${actorKey}`, async () => {
        await actor.update?.(computeDamageBoxesFromBaseline(baseline, track, totalBoxes));
    });
}
