import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { executeSimpleFlow } from "./simpleFlow";
import { SR3ERoll } from "./SR3ERoll";
import type { ProcedureSetup } from "../procedures/simpleSetups";

function mockRollGlobal(results: number[]) {
    class MockRoll {
        terms = [{ results: results.map(r => ({ result: r, active: true })) }];
        async evaluate() { return this; }
    }
    (globalThis as Record<string, unknown>).Roll = MockRoll;
}

beforeEach(() => mockRollGlobal([5]));
afterEach(() => { delete (globalThis as Record<string, unknown>).Roll; });

async function makeRoll(tn = 4) {
    return SR3ERoll.build(1, tn).evaluate();
}

const setup = (selfPublish: boolean, commitFn = vi.fn().mockResolvedValue(undefined)): ProcedureSetup => ({
    kind: "skill", title: "Skill Roll", rollState: { dice: 4, poolDice: 0, karmaDice: 0, targetNumber: 4, modifiers: [] },
    lockPriority: "simple", selfPublish, defenseHint: null,
    exportFn: () => ({} as never), commitFn,
});

describe("executeSimpleFlow", () => {
    it("calls commitFn with roll snapshot and actor", async () => {
        const fn = vi.fn().mockResolvedValue(undefined);
        const s = setup(false, fn);
        const roll = await makeRoll();
        const actor = {};
        await executeSimpleFlow(s, s.rollState, roll, actor);
        expect(fn).toHaveBeenCalledWith(roll.toSnapshot(), actor);
    });
    it("commitFn called even when selfPublish false", async () => {
        const fn = vi.fn().mockResolvedValue(undefined);
        await executeSimpleFlow(setup(false, fn), setup(false).rollState, await makeRoll(), {});
        expect(fn).toHaveBeenCalledOnce();
    });
    it("ChatMessage.create not called when selfPublish false", async () => {
        const create = vi.fn();
        (globalThis as Record<string, unknown>).ChatMessage = { create, getSpeaker: vi.fn() };
        await executeSimpleFlow(setup(false), setup(false).rollState, await makeRoll(), {});
        expect(create).not.toHaveBeenCalled();
        delete (globalThis as Record<string, unknown>).ChatMessage;
    });
    it("ChatMessage.create called when selfPublish true", async () => {
        const create = vi.fn().mockResolvedValue(undefined);
        (globalThis as Record<string, unknown>).ChatMessage = { create, getSpeaker: vi.fn().mockReturnValue({}) };
        await executeSimpleFlow(setup(true), setup(true).rollState, await makeRoll(), {});
        expect(create).toHaveBeenCalledOnce();
        delete (globalThis as Record<string, unknown>).ChatMessage;
    });
});
