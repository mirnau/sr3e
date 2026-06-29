import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { executeSimpleFlow } from "./simpleFlow";
import { SR3ERoll } from "./SR3ERoll";
import type { ProcedureSetup } from "../procedures/simpleSetups";

function mockRollGlobal(results: number[]) {
    class MockRoll {
        terms = [{ results: results.map(r => ({ result: r, active: true })) }];
        toMessage = vi.fn().mockResolvedValue(undefined);
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
    it("roll.toMessage not called when selfPublish false", async () => {
        const roll = await makeRoll();
        const spy = vi.spyOn(roll, "toMessage").mockResolvedValue(undefined);
        await executeSimpleFlow(setup(false), setup(false).rollState, roll, {});
        expect(spy).not.toHaveBeenCalled();
    });
    it("ChatMessage.create called with rolls array when selfPublish true", async () => {
        const createFn = vi.fn().mockResolvedValue(undefined);
        (globalThis as Record<string, unknown>).ChatMessage = {
            getSpeaker: vi.fn().mockReturnValue({}),
            create: createFn,
        };
        const roll = await makeRoll();
        await executeSimpleFlow(setup(true), setup(true).rollState, roll, {});
        expect(createFn).toHaveBeenCalledWith(expect.objectContaining({ rolls: expect.any(Array) }));
        delete (globalThis as Record<string, unknown>).ChatMessage;
    });
});
