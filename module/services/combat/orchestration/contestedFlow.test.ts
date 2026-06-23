import { describe, it, expect, vi, beforeAll, beforeEach, afterAll, afterEach } from "vitest";
import { executeContestedFlow } from "./contestedFlow";
import { _resetForTest, deliverResponse } from "../engine/contestCoordinator";
import { SR3ERoll } from "./SR3ERoll";
import type { ProcedureSetup } from "../procedures/simpleSetups";
import type { ContestExport } from "../engine/types";

class MockRoll {
    terms = [{ results: [{ result: 5, active: true }, { result: 5, active: true }] }];
    async evaluate() { return this; }
}
(globalThis as Record<string, unknown>).Roll = MockRoll;
afterAll(() => { delete (globalThis as Record<string, unknown>).Roll; });

let roll: SR3ERoll;
beforeAll(async () => { roll = await SR3ERoll.build(2, 4).evaluate(); });

beforeEach(() => {
    _resetForTest();
    (globalThis as Record<string, unknown>).game = {
        user: { id: "u1" },
        socket: { emit: vi.fn() },
    };
});
afterEach(() => { delete (globalThis as Record<string, unknown>).game; });

const exportCtx = (): ContestExport => ({
    familyKey: "firearm", weaponId: null, weaponName: "Predator",
    plan: null, damage: null, tnBase: 5, tnMods: [],
    next: { kind: "dodge", ui: {}, args: {} },
});

const setup = (commitFn = vi.fn().mockResolvedValue(undefined)): ProcedureSetup => ({
    kind: "firearm", title: "Fire",
    rollState: { dice: 4, poolDice: 0, karmaDice: 0, targetNumber: 4, modifiers: [] },
    lockPriority: "advanced", selfPublish: true,
    defenseHint: { type: "attribute", key: "reaction", tnMod: 0, tnLabel: "Reaction" },
    exportFn: exportCtx,
    commitFn,
});

const actor = () => ({ id: "att1", uuid: "Actor.att1", system: {} });

function makeTarget(id = "def1") {
    return {
        id, scene: { id: "s1" },
        actor: {
            id, name: "Defender",
            uuid: `Actor.${id}`,
            system: { attributes: { body: { value: 4, total: 4 } }, health: { physical: { value: 0 }, stun: { value: 0 }, overflow: { value: 0 } } },
            items: { contents: [] },
            update: vi.fn().mockResolvedValue(undefined),
        },
    };
}

describe("executeContestedFlow", () => {
    it("commitFn called with no targets", async () => {
        const fn = vi.fn().mockResolvedValue(undefined);
        await executeContestedFlow(setup(fn), setup(fn).rollState, roll, actor(), []);
        expect(fn).toHaveBeenCalledOnce();
    });

    it("aborted contest → resistanceFn NOT called", async () => {
        const resistFn = vi.fn();
        const s = setup();
        const target = makeTarget();

        const runPromise = executeContestedFlow(s, s.rollState, roll, actor(), [target], { promptResistanceFn: resistFn });
        await new Promise(r => setTimeout(r, 0));

        const emitCalls = ((game as Record<string, unknown>).socket as { emit: ReturnType<typeof vi.fn> }).emit.mock.calls;
        if (emitCalls.length > 0) {
            const { stub } = emitCalls[0][1] as { stub: { contestId: string } };
            deliverResponse(stub.contestId, { terms: [], options: { targetNumber: undefined, __aborted: true }, meta: { flavor: "", procedureKind: "__aborted" } });
        }

        await runPromise;
        expect(resistFn).not.toHaveBeenCalled();
    });

    it("attacker wins → promptResistanceFn called when damage present", async () => {
        const resistFn = vi.fn().mockResolvedValue(undefined);
        const ctx = exportCtx();
        ctx.damage = { power: 5, damageType: "mp", armorUse: "ballistic", armorMult: { ballistic: 1, impact: 1 }, levelDelta: 0, attackTNAdd: 0, resistTNAdd: 0, notes: [], directives: [] } as never;

        const s: ProcedureSetup = { ...setup(), exportFn: () => ctx };
        const target = makeTarget();

        const runPromise = executeContestedFlow(s, s.rollState, roll, actor(), [target], { promptResistanceFn: resistFn });
        await new Promise(r => setTimeout(r, 0));

        const emitCalls = ((game as Record<string, unknown>).socket as { emit: ReturnType<typeof vi.fn> }).emit.mock.calls;
        if (emitCalls.length > 0) {
            const { stub } = emitCalls[0][1] as { stub: { contestId: string } };
            deliverResponse(stub.contestId, { terms: [{ results: [{ result: 1, active: true }] }], options: { targetNumber: 4 }, meta: { flavor: "", procedureKind: "dodge" } });
        }

        await runPromise;
        expect(resistFn).toHaveBeenCalledOnce();
    });

    it("defender wins → promptResistanceFn NOT called", async () => {
        const resistFn = vi.fn().mockResolvedValue(undefined);
        const ctx = exportCtx();
        ctx.damage = { power: 5 } as never;

        const s: ProcedureSetup = { ...setup(), exportFn: () => ctx };
        const target = makeTarget();

        const runPromise = executeContestedFlow(s, s.rollState, roll, actor(), [target], { promptResistanceFn: resistFn });
        await new Promise(r => setTimeout(r, 0));

        const emitCalls = ((game as Record<string, unknown>).socket as { emit: ReturnType<typeof vi.fn> }).emit.mock.calls;
        if (emitCalls.length > 0) {
            const { stub } = emitCalls[0][1] as { stub: { contestId: string } };
            deliverResponse(stub.contestId, { terms: [{ results: [{ result: 5, active: true }, { result: 5, active: true }, { result: 5, active: true }, { result: 5, active: true }] }], options: { targetNumber: 4 }, meta: { flavor: "", procedureKind: "dodge" } });
        }

        await runPromise;
        expect(resistFn).not.toHaveBeenCalled();
    });
});
