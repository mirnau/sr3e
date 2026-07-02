import { describe, expect, it, vi } from "vitest";
import { applyDamageBoxes, applyDamageBoxesFromBaseline, captureHealthBaseline } from "./damageApplication";

let nextKey = 0;
function actorKey(): string { return `test-actor-${nextKey++}`; }

function actor(stun = 0, physical = 0, overflow = 0) {
    return {
        system: { health: { stun: { value: stun }, physical: { value: physical }, overflow: { value: overflow } } },
        update: vi.fn().mockResolvedValue(undefined),
    };
}

describe("applyDamageBoxes (incremental)", () => {
    it("adds boxes without spilling when under the track max", async () => {
        const a = actor(3);
        await applyDamageBoxes(a, actorKey(), "stun", 4);
        expect(a.update).toHaveBeenCalledWith({ "system.health.stun.value": 7 });
    });

    it("spills stun overflow into physical", async () => {
        const a = actor(8, 2);
        await applyDamageBoxes(a, actorKey(), "stun", 5);
        expect(a.update).toHaveBeenCalledWith({
            "system.health.stun.value": 10,
            "system.health.physical.value": 5,
        });
    });

    it("spills stun through physical into the overflow track when both fill", async () => {
        const a = actor(9, 9, 1);
        await applyDamageBoxes(a, actorKey(), "stun", 5);
        expect(a.update).toHaveBeenCalledWith({
            "system.health.stun.value": 10,
            "system.health.physical.value": 10,
            "system.health.overflow.value": 4,
        });
    });

    it("does nothing for zero or negative boxes", async () => {
        const a = actor(3);
        await applyDamageBoxes(a, actorKey(), "stun", 0);
        expect(a.update).not.toHaveBeenCalled();
    });
});

describe("applyDamageBoxesFromBaseline (idempotent recompute)", () => {
    it("gives health back when a later recompute has fewer total boxes than a prior call", async () => {
        const a = actor();
        const baseline = captureHealthBaseline(a);
        const key = actorKey();

        await applyDamageBoxesFromBaseline(a, key, baseline, "stun", 8);
        expect(a.update).toHaveBeenLastCalledWith({
            "system.health.stun.value": 8,
            "system.health.physical.value": 0,
            "system.health.overflow.value": 0,
        });

        await applyDamageBoxesFromBaseline(a, key, baseline, "stun", 3);
        expect(a.update).toHaveBeenLastCalledWith({
            "system.health.stun.value": 3,
            "system.health.physical.value": 0,
            "system.health.overflow.value": 0,
        });
    });

    it("un-spills physical/overflow when a recompute drops below the spill threshold", async () => {
        const a = actor(0, 2, 0);
        const baseline = captureHealthBaseline(a);
        const key = actorKey();

        await applyDamageBoxesFromBaseline(a, key, baseline, "stun", 13);
        expect(a.update).toHaveBeenLastCalledWith({
            "system.health.stun.value": 10,
            "system.health.physical.value": 5,
            "system.health.overflow.value": 0,
        });

        await applyDamageBoxesFromBaseline(a, key, baseline, "stun", 4);
        expect(a.update).toHaveBeenLastCalledWith({
            "system.health.stun.value": 4,
            "system.health.physical.value": 2,
            "system.health.overflow.value": 0,
        });
    });

    it("caps physical drain at track max and spills into overflow", async () => {
        const a = actor(0, 8, 1);
        const baseline = captureHealthBaseline(a);

        await applyDamageBoxesFromBaseline(a, actorKey(), baseline, "physical", 5);

        expect(a.update).toHaveBeenLastCalledWith({
            "system.health.physical.value": 10,
            "system.health.overflow.value": 4,
        });
    });

    it("serializes overlapping recomputes so the second call's write always lands after the first's", async () => {
        const a = actor();
        const baseline = captureHealthBaseline(a);
        const key = actorKey();
        const order: number[] = [];
        const originalUpdate = a.update;
        a.update = vi.fn().mockImplementation(async (data: Record<string, unknown>) => {
            order.push(data["system.health.stun.value"] as number);
            return originalUpdate(data);
        });

        const first = applyDamageBoxesFromBaseline(a, key, baseline, "stun", 8);
        const second = applyDamageBoxesFromBaseline(a, key, baseline, "stun", 3);
        await Promise.all([first, second]);

        expect(order).toEqual([8, 3]);
        expect(a.update).toHaveBeenLastCalledWith(expect.objectContaining({ "system.health.stun.value": 3 }));
    });
});
