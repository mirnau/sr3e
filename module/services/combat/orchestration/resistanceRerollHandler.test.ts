import { describe, expect, it, vi, afterEach } from "vitest";
import {
    applyResistanceDelta,
    canActOnResistance,
    computeResistanceOutcome,
    handleResistanceBuy,
    handleResistanceDone,
    handleResistanceReroll,
    rerenderResistanceMessage,
    type ResistanceOutcomeFlag,
} from "./resistanceRerollHandler";
import type { ResistanceBuild } from "../resistanceEngine";

function mockRoll(results: number[]) {
    class MockRoll {
        terms = [{ results: results.map(r => ({ result: r, active: true })) }];
        async evaluate() { return this; }
    }
    (globalThis as Record<string, unknown>).Roll = MockRoll;
}

function build(overrides: Partial<ResistanceBuild> = {}): ResistanceBuild {
    return {
        trackKey: "physical",
        tnBase: 6,
        tnMods: [],
        tn: 6,
        armor: { armorType: "ballistic", base: 0, effective: 0, ballisticBase: 0, impactBase: 0 },
        stagedStepBeforeResist: "s", // Serious, 6 boxes
        boxesIfUnresisted: 6,
        ...overrides,
    };
}

function flag(overrides: Partial<ResistanceOutcomeFlag> = {}): ResistanceOutcomeFlag {
    return {
        actorId: "def1",
        actorName: "Defender",
        prep: { familyKey: "firearm", weaponId: null, weaponName: "Predator", tnBase: 6, tnMods: [], stagedStepBeforeResist: "s", trackKey: "physical", boxesIfUnresisted: 6 },
        build: build(),
        baseline: { stun: 0, physical: 0, overflow: 0 },
        options: { targetNumber: 6 },
        meta: { flavor: "Resist", procedureKind: "resistance" },
        results: [{ result: 1 }, { result: 2 }],
        rerollCount: 0,
        ...overrides,
    };
}

function setGame(userId: string, isGM: boolean, actor: Record<string, unknown> | null, extra: Record<string, unknown> = {}) {
    (globalThis as Record<string, unknown>).game = {
        user: { id: userId, isGM },
        users: new Map([[userId, { id: userId, isGM, active: true }]]),
        actors: { get: (id: string) => (actor && (actor as Record<string, unknown>).id === id ? actor : undefined) },
        ...extra,
    };
}

afterEach(() => {
    delete (globalThis as Record<string, unknown>).game;
    delete (globalThis as Record<string, unknown>).Hooks;
    delete (globalThis as Record<string, unknown>).Roll;
});

describe("computeResistanceOutcome", () => {
    it("stages damage down as successes increase", () => {
        expect(computeResistanceOutcome(flag({ results: [] })).outcome.boxes).toBe(6); // Serious, 0 successes
        expect(computeResistanceOutcome(flag({ results: [{ result: 6 }, { result: 6 }] })).outcome.boxes).toBe(3); // 2 successes -> Moderate
    });

    it("resolves to no damage once fully staged off", () => {
        const { outcome } = computeResistanceOutcome(flag({ build: build({ stagedStepBeforeResist: "l" }), results: [{ result: 6 }, { result: 6 }] }));
        expect(outcome.applied).toBe(false);
        expect(outcome.boxes).toBe(0);
    });
});

describe("canActOnResistance", () => {
    it("allows a GM regardless of ownership", () => {
        setGame("gm1", true, null);
        expect(canActOnResistance(flag())).toBe(true);
    });

    it("allows the defender's controlling player", () => {
        setGame("player1", false, { id: "def1", ownership: { player1: 3 } });
        expect(canActOnResistance(flag())).toBe(true);
    });

    it("denies an unrelated player", () => {
        setGame("player2", false, { id: "def1", ownership: { player1: 3 } });
        expect(canActOnResistance(flag())).toBe(false);
    });
});

describe("handleResistanceReroll / handleResistanceBuy", () => {
    it("does nothing when the clicking user is not authorized", async () => {
        const messageUpdate = vi.fn();
        setGame("player2", false, { id: "def1", ownership: { player1: 3 } }, { messages: { get: () => ({ update: messageUpdate }) } });

        await handleResistanceReroll("msg1", flag());
        await handleResistanceBuy("msg1", flag());

        expect(messageUpdate).not.toHaveBeenCalled();
    });

    it("recomputes the outcome from the build and persists through the message when authorized", async () => {
        const update = vi.fn().mockResolvedValue(undefined);
        const actor = { id: "def1", system: { karma: { karmaPool: { value: 5 }, karmaPoolCeiling: 5 } }, update };
        const messageUpdate = vi.fn();
        setGame("gm1", true, actor, { messages: { get: (id: string) => (id === "msg1" ? { update: messageUpdate } : undefined) } });

        const naturalSuccessFlag = flag({ results: [{ result: 6 }], build: build({ stagedStepBeforeResist: "l" }) });
        await handleResistanceBuy("msg1", naturalSuccessFlag);

        expect(update).toHaveBeenCalled();
        expect(messageUpdate).toHaveBeenCalledWith(expect.objectContaining({
            content: expect.any(String),
            "flags.sr3e.resistanceOutcome": expect.objectContaining({
                results: expect.arrayContaining([expect.objectContaining({ bought: true })]),
            }),
        }));
    });

    it("only spends Karma Pool on reroll — never touches actor health", async () => {
        // Health is applied exactly once, via handleResistanceDone, not on
        // every reroll/buy — same lost-update hazard as Drain otherwise.
        const actor = {
            id: "def1",
            system: { health: { stun: { value: 0 }, physical: { value: 0 }, overflow: { value: 0 } }, karma: { karmaPool: { value: 5 }, karmaPoolCeiling: 5 } },
            update: vi.fn().mockResolvedValue(undefined),
        };
        const messageUpdate = vi.fn().mockResolvedValue(undefined);
        setGame("gm1", true, actor, { messages: { get: (id: string) => (id === "msg1" ? { update: messageUpdate } : undefined) } });

        mockRoll([6, 6, 6]);
        await handleResistanceReroll("msg1", flag({ results: [{ result: 1 }, { result: 2 }, { result: 3 }] }));

        expect(actor.update).toHaveBeenCalledTimes(1);
        expect(actor.update).toHaveBeenCalledWith({ "system.karma.karmaPool.value": 4 }, { render: false });
    });
});

describe("handleResistanceDone", () => {
    it("applies health from baseline using the currently staged results, exactly once", async () => {
        const actor = {
            id: "def1",
            system: { health: { stun: { value: 0 }, physical: { value: 0 }, overflow: { value: 0 } } },
            update: vi.fn().mockResolvedValue(undefined),
        };
        setGame("gm1", true, actor);
        (globalThis as Record<string, unknown>).Hooks = { callAll: vi.fn(), on: vi.fn(() => 1), off: vi.fn() };

        // 2 successes -> Serious staged down to Moderate -> 3 boxes.
        const finalFlag = flag({ results: [{ result: 6 }, { result: 6 }] });
        await handleResistanceDone(finalFlag);

        expect(actor.update).toHaveBeenCalledTimes(1);
        expect(actor.update).toHaveBeenCalledWith({
            "system.health.physical.value": 3,
            "system.health.overflow.value": 0,
        });
    });

    it("does not write when damage is fully staged off", async () => {
        const actor = {
            id: "def1",
            system: { health: { stun: { value: 0 }, physical: { value: 0 }, overflow: { value: 0 } } },
            update: vi.fn().mockResolvedValue(undefined),
        };
        setGame("gm1", true, actor);
        (globalThis as Record<string, unknown>).Hooks = { callAll: vi.fn() };

        const staged = flag({ build: build({ stagedStepBeforeResist: "l" }), results: [{ result: 6 }, { result: 6 }] });
        await handleResistanceDone(staged);

        expect(actor.update).not.toHaveBeenCalled();
    });

    it("does nothing when the clicking user is not authorized", async () => {
        const actor = { id: "def1", system: { health: { stun: { value: 0 }, physical: { value: 0 }, overflow: { value: 0 } } }, update: vi.fn() };
        setGame("player2", false, { ...actor, ownership: { player1: 3 } });

        await handleResistanceDone(flag());

        expect(actor.update).not.toHaveBeenCalled();
    });
});

describe("applyResistanceDelta (race safety)", () => {
    it("merges against the message's CURRENT persisted flag, not the stale fallback", async () => {
        const persisted = flag({ results: [{ result: 6 }], rerollCount: 1 });
        const update = vi.fn().mockResolvedValue(undefined);
        (globalThis as Record<string, unknown>).game = {
            user: { id: "gm1", isGM: true },
            messages: { get: () => ({ flags: { sr3e: { resistanceOutcome: persisted } }, update }) },
        };

        const staleFallback = flag(); // still shows the original [1, 2] results
        await applyResistanceDelta("msg1", { results: [{ result: 6 }, { result: 4 }], rerollCount: 2 }, staleFallback);

        const written = update.mock.calls[0]?.[0]["flags.sr3e.resistanceOutcome"] as ResistanceOutcomeFlag;
        expect(written.results).toEqual([{ result: 6 }, { result: 4 }]);
        expect(written.rerollCount).toBe(2);
    });

    it("serializes overlapping writes so the second sees the first's result", async () => {
        const state = { current: flag() };
        const update = vi.fn().mockImplementation(async (data: Record<string, unknown>) => {
            state.current = data["flags.sr3e.resistanceOutcome"] as ResistanceOutcomeFlag;
        });
        (globalThis as Record<string, unknown>).game = {
            user: { id: "gm1", isGM: true },
            messages: { get: () => ({ flags: { sr3e: { resistanceOutcome: state.current } }, update }) },
        };

        const first = applyResistanceDelta("msg-race", { results: [{ result: 3 }], rerollCount: 1 }, flag());
        const second = applyResistanceDelta("msg-race", { results: [{ result: 3 }, { result: 5 }], rerollCount: 2 }, flag());
        await Promise.all([first, second]);

        expect(state.current.results).toEqual([{ result: 3 }, { result: 5 }]);
        expect(state.current.rerollCount).toBe(2);
    });
});

describe("rerenderResistanceMessage", () => {
    it("renders the success message when damage is fully staged off", () => {
        const html = rerenderResistanceMessage(flag({ build: build({ stagedStepBeforeResist: "l" }), results: [{ result: 6 }, { result: 6 }] }));
        expect(html).toContain("takes no damage");
    });

    it("renders the damage message with the box count when not fully resisted", () => {
        const html = rerenderResistanceMessage(flag({ results: [] }));
        expect(html).toContain("6 box");
    });
});
