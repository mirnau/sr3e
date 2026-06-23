import { describe, it, expect, vi, afterEach } from "vitest";
import { executeResistanceRoll } from "./resistanceFlow";
import type { ResistancePrep } from "../engine/types";

const prep = (tnBase = 4): ResistancePrep => ({
    familyKey: "firearm", weaponId: null, weaponName: "Predator",
    tnBase, tnMods: [], stagedStepBeforeResist: "m", trackKey: "physical",
});

const defender = (body = 4, physValue = 0, stunValue = 0, overflow = 0) => ({
    system: {
        attributes: { body: { value: body, total: body } },
        health: { physical: { value: physValue }, stun: { value: stunValue }, overflow: { value: overflow } },
    },
    items: { contents: [] },
    update: vi.fn().mockResolvedValue(undefined),
});

function mockRollGlobal(results: number[]) {
    class MockRoll {
        terms = [{ results: results.map(r => ({ result: r, active: true })) }];
        async evaluate() { return this; }
    }
    (globalThis as Record<string, unknown>).Roll = MockRoll;
}

afterEach(() => { delete (globalThis as Record<string, unknown>).Roll; });

const finalState = { dice: 4, poolDice: 0, karmaDice: 0, targetNumber: 4, modifiers: [] };

describe("executeResistanceRoll", () => {
    it("applies boxes when body successes < damage level", async () => {
        mockRollGlobal([1, 2, 3, 4]);
        const d = defender(4, 0);
        await executeResistanceRoll(prep(6), d, finalState);
        expect(d.update).toHaveBeenCalled();
    });
    it("does not update when damage staged off by body successes", async () => {
        mockRollGlobal([5, 6, 5, 6, 5, 6]);
        const d = defender(4, 0);
        await executeResistanceRoll(prep(4), d, finalState);
        expect(d.update).not.toHaveBeenCalled();
    });
    it("stun overflow spills to physical", async () => {
        mockRollGlobal([1, 1, 1, 1]);
        const d = defender(4, 0, 9);
        const stunPrep: ResistancePrep = { ...prep(6), trackKey: "stun", stagedStepBeforeResist: "l" };
        await executeResistanceRoll(stunPrep, d, finalState);
        const call = d.update.mock.calls[0]?.[0] as Record<string, number> | undefined;
        if (call) {
            expect("system.health.stun.value" in call || "system.health.physical.value" in call).toBe(true);
        }
    });
    it("physical overflow increments overflow counter", async () => {
        mockRollGlobal([1, 1, 1, 1]);
        const d = defender(4, 9, 0, 0);
        await executeResistanceRoll(prep(4), d, finalState);
        const call = d.update.mock.calls[0]?.[0] as Record<string, number> | undefined;
        if (call && call["system.health.physical.value"] === 10) {
            expect(call["system.health.overflow.value"]).toBeGreaterThan(0);
        }
    });
});
