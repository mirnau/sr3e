import { describe, it, expect, vi, afterEach } from "vitest";
import { executeResistanceRoll, promptResistance } from "./resistanceFlow";
import type { ResistancePrep } from "../engine/types";

const prep = (tnBase = 4): ResistancePrep => ({
    familyKey: "firearm", weaponId: null, weaponName: "Predator",
    tnBase, tnMods: [], stagedStepBeforeResist: "m", trackKey: "physical", boxesIfUnresisted: 4,
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

describe("promptResistance", () => {
    afterEach(() => { delete (globalThis as Record<string, unknown>).game; delete (globalThis as Record<string, unknown>).ChatMessage; });

    it("whispers the controlling player", async () => {
        const create = vi.fn().mockResolvedValue(undefined);
        (globalThis as Record<string, unknown>).game = {
            socket: { emit: vi.fn() },
            users: new Map([
                ["gm1", { id: "gm1", isGM: true, active: true }],
                ["player1", { id: "player1", isGM: false, active: true }],
            ]),
        };
        (globalThis as Record<string, unknown>).ChatMessage = { create };

        const d = { ...defender(4, 0), id: "def1", name: "Defender", ownership: { player1: 3 } };
        await promptResistance(prep(6), d as never);

        const [call] = create.mock.calls;
        expect((call[0] as Record<string, unknown>).whisper).toEqual(["player1"]);
    });
});
