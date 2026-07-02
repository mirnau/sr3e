import { describe, it, expect, vi, beforeAll, beforeEach, afterAll, afterEach } from "vitest";
import { executeContestedFlow } from "./contestedFlow";
import { _resetForTest, deliverResponse, resolveBothDone } from "../engine/contestCoordinator";
import { SR3ERoll } from "./SR3ERoll";
import type { ProcedureSetup } from "../procedures/simpleSetups";
import type { ContestExport } from "../engine/types";
import type { ContestOutcomeFlag } from "./contestRerollHandler";

class MockRoll {
    terms = [{ results: [{ result: 5, active: true }, { result: 5, active: true }] }];
    async evaluate() { return this; }
}
(globalThis as Record<string, unknown>).Roll = MockRoll;
afterAll(() => { delete (globalThis as Record<string, unknown>).Roll; });

let roll: SR3ERoll;
beforeAll(async () => { roll = await SR3ERoll.build(2, 4).evaluate(); });

let chatMessageCreate: ReturnType<typeof vi.fn>;
beforeEach(() => {
    _resetForTest();
    (globalThis as Record<string, unknown>).game = {
        user: { id: "u1" },
        socket: { emit: vi.fn() },
    };
    chatMessageCreate = vi.fn().mockResolvedValue({ id: "msg1" });
    (globalThis as Record<string, unknown>).ChatMessage = { create: chatMessageCreate, getSpeaker: vi.fn() };
});
afterEach(() => {
    delete (globalThis as Record<string, unknown>).game;
    delete (globalThis as Record<string, unknown>).ChatMessage;
});

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

// Delivers the defender's roll response (same as before), then reads the
// posted contestOutcome flag straight out of the ChatMessage.create() call
// to build a "both done" signal — the flag's own initiator/target results
// are what computeFinalNetSuccesses acts on, so tests can override them
// directly to simulate a reroll's outcome without a real UI round-trip.
function completeContest(overrides: Partial<{ initiatorResults: unknown[]; targetResults: unknown[] }> = {}): void {
    const flagArg = chatMessageCreate.mock.calls[0]?.[0]?.flags?.sr3e?.contestOutcome as ContestOutcomeFlag;
    const finalFlag: ContestOutcomeFlag = {
        ...flagArg,
        initiator: { ...flagArg.initiator, results: (overrides.initiatorResults as never) ?? flagArg.initiator.results, done: true },
        target: { ...flagArg.target, results: (overrides.targetResults as never) ?? flagArg.target.results, done: true },
    };
    resolveBothDone(flagArg.contestId, finalFlag);
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

    it("attacker wins and both sides click Done → promptResistanceFn called when damage present", async () => {
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
        await new Promise(r => setTimeout(r, 0));

        completeContest();
        await runPromise;
        expect(resistFn).toHaveBeenCalledOnce();
    });

    it("defender wins and both sides click Done → promptResistanceFn NOT called", async () => {
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
        await new Promise(r => setTimeout(r, 0));

        completeContest();
        await runPromise;
        expect(resistFn).not.toHaveBeenCalled();
    });

    it("attacker initially loses but rerolls to a net success before Done → promptResistanceFn IS called", async () => {
        const resistFn = vi.fn().mockResolvedValue(undefined);
        const ctx = exportCtx();
        ctx.damage = { power: 5 } as never;

        const s: ProcedureSetup = { ...setup(), exportFn: () => ctx };
        const target = makeTarget();

        const runPromise = executeContestedFlow(s, s.rollState, roll, actor(), [target], { promptResistanceFn: resistFn });
        await new Promise(r => setTimeout(r, 0));

        // Defender rolls better than the attacker's initial 2 successes.
        const emitCalls = ((game as Record<string, unknown>).socket as { emit: ReturnType<typeof vi.fn> }).emit.mock.calls;
        if (emitCalls.length > 0) {
            const { stub } = emitCalls[0][1] as { stub: { contestId: string } };
            deliverResponse(stub.contestId, { terms: [{ results: [{ result: 5, active: true }, { result: 5, active: true }, { result: 5, active: true }] }], options: { targetNumber: 4 }, meta: { flavor: "", procedureKind: "dodge" } });
        }
        await new Promise(r => setTimeout(r, 0));

        // Nothing should have resolved yet — waiting on both-done, not the initial outcome.
        expect(resistFn).not.toHaveBeenCalled();

        // Attacker rerolls up to a decisive net success, then both click Done.
        completeContest({
            initiatorResults: [{ result: 6 }, { result: 6 }, { result: 6 }, { result: 6 }],
        });
        await runPromise;
        expect(resistFn).toHaveBeenCalledOnce();
    });

    // A challenge (attribute-response / skill-response, e.g. two characters
    // competing at the same skill) never has a damage packet — most
    // successes just wins, no resistance/damage step follows regardless of
    // how decisively either side wins.
    it("challenge roll (damage: null) never triggers promptResistanceFn, even on a decisive win", async () => {
        const resistFn = vi.fn().mockResolvedValue(undefined);
        const ctx = exportCtx();
        ctx.damage = null;
        ctx.next = { kind: "attribute-response", ui: {}, args: { attributeKey: "strength" } };

        const s: ProcedureSetup = { ...setup(), exportFn: () => ctx };
        const target = makeTarget();

        const runPromise = executeContestedFlow(s, s.rollState, roll, actor(), [target], { promptResistanceFn: resistFn });
        await new Promise(r => setTimeout(r, 0));

        const emitCalls = ((game as Record<string, unknown>).socket as { emit: ReturnType<typeof vi.fn> }).emit.mock.calls;
        if (emitCalls.length > 0) {
            const { stub } = emitCalls[0][1] as { stub: { contestId: string } };
            deliverResponse(stub.contestId, { terms: [{ results: [{ result: 1, active: true }] }], options: { targetNumber: 4 }, meta: { flavor: "", procedureKind: "attribute-response" } });
        }
        await new Promise(r => setTimeout(r, 0));

        completeContest();
        await runPromise;
        expect(resistFn).not.toHaveBeenCalled();
    });
});
