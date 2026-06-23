import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { executeProcedure } from "./executeProcedure";
import { _resetForTest as resetLock } from "../engine/procedureLock";
import { _resetForTest as resetContest } from "../engine/contestCoordinator";
import type { ProcedureSetup } from "../procedures/simpleSetups";

beforeEach(() => {
    resetLock();
    resetContest();
    class MockRoll {
        terms = [{ results: [{ result: 5, active: true }] }];
        async evaluate() { return this; }
    }
    (globalThis as Record<string, unknown>).Roll = MockRoll;
});

afterEach(() => { delete (globalThis as Record<string, unknown>).Roll; });

const setup = (overrides: Partial<ProcedureSetup> = {}): ProcedureSetup => ({
    kind: "skill", title: "Test Roll",
    rollState: { dice: 4, poolDice: 0, karmaDice: 0, targetNumber: 4, modifiers: [] },
    lockPriority: "simple", selfPublish: false,
    defenseHint: null,
    exportFn: () => ({ familyKey: "skill", weaponId: null, weaponName: "", plan: null, damage: null, tnBase: 4, tnMods: [], next: { kind: "none", ui: {}, args: {} } }),
    commitFn: vi.fn().mockResolvedValue(undefined),
    ...overrides,
});

const actor = (id = "a1") => ({ id, system: {} });

describe("executeProcedure", () => {
    it("returns succeeded true on simple roll", async () => {
        const result = await executeProcedure(setup(), actor());
        expect(result.succeeded).toBe(true);
    });
    it("calls commitFn", async () => {
        const fn = vi.fn().mockResolvedValue(undefined);
        await executeProcedure(setup({ commitFn: fn }), actor());
        expect(fn).toHaveBeenCalledOnce();
    });
    it("lock-denied when advanced lock held", async () => {
        let unblock!: () => void;
        const held = new Promise<void>(r => { unblock = r; });
        const blocking = setup({ kind: "firearm", lockPriority: "advanced", commitFn: vi.fn().mockReturnValue(held) });

        const firstPromise = executeProcedure(blocking, actor());
        await new Promise(r => setTimeout(r, 0));

        const result = await executeProcedure(setup(), actor());
        expect(result).toEqual({ succeeded: false, reason: "lock-denied" });

        unblock();
        await firstPromise;
    });
    it("full-defense override returns full-defense", async () => {
        const result = await executeProcedure(setup(), actor(), { fullDefenseOverride: true });
        expect(result).toEqual({ succeeded: false, reason: "full-defense" });
    });
    it("lock released after completion allowing next roll", async () => {
        await executeProcedure(setup(), actor());
        const result = await executeProcedure(setup(), actor());
        expect(result.succeeded).toBe(true);
    });
    it("lock released after error", async () => {
        const brokenSetup = setup({ commitFn: vi.fn().mockRejectedValue(new Error("boom")) });
        await executeProcedure(brokenSetup, actor()).catch(() => {});
        const result = await executeProcedure(setup(), actor());
        expect(result.succeeded).toBe(true);
    });
});
