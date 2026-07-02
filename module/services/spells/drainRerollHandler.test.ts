import { describe, expect, it, vi, afterEach } from "vitest";
import { applyDrainDelta, canActOnDrain, computeDrainOutcome, handleDrainBuy, handleDrainDone, handleDrainReroll, rerenderDrainMessage, type DrainOutcomeFlag } from "./drainRerollHandler";

function mockRoll(results: number[]) {
    class MockRoll {
        terms = [{ results: results.map(r => ({ result: r, active: true })) }];
        async evaluate() { return this; }
    }
    (globalThis as Record<string, unknown>).Roll = MockRoll;
}

function flag(overrides: Partial<DrainOutcomeFlag> = {}): DrainOutcomeFlag {
    return {
        actorId: "a1",
        actorName: "Mage",
        spellName: "Manabolt",
        tn: 4,
        baseLevel: "s",
        track: "stun",
        baseline: { stun: 0, physical: 0, overflow: 0 },
        options: { targetNumber: 4 },
        meta: { flavor: "Drain", procedureKind: "spell-drain" },
        results: [{ result: 1 }, { result: 2 }],
        rerollCount: 0,
        magicLoss: null,
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

describe("computeDrainOutcome", () => {
    it("stages damage down as successes increase", () => {
        expect(computeDrainOutcome(flag({ results: [] })).boxes).toBe(6); // Serious, 0 successes
        expect(computeDrainOutcome(flag({ results: [{ result: 6 }, { result: 6 }] })).boxes).toBe(3); // 2 successes -> Moderate
    });

    it("resolves to zero boxes once fully staged off", () => {
        const outcome = computeDrainOutcome(flag({ baseLevel: "l", results: [{ result: 6 }, { result: 6 }] }));
        expect(outcome.final).toBeNull();
        expect(outcome.boxes).toBe(0);
    });
});

describe("canActOnDrain", () => {
    it("allows a GM regardless of ownership", () => {
        setGame("gm1", true, null);
        expect(canActOnDrain(flag())).toBe(true);
    });

    it("allows the caster's controlling player", () => {
        setGame("player1", false, { id: "a1", ownership: { player1: 3 } });
        expect(canActOnDrain(flag())).toBe(true);
    });

    it("denies an unrelated player", () => {
        setGame("player2", false, { id: "a1", ownership: { player1: 3 } });
        expect(canActOnDrain(flag())).toBe(false);
    });
});

describe("handleDrainReroll / handleDrainBuy", () => {
    it("does nothing when the clicking user is not authorized", async () => {
        const messageUpdate = vi.fn();
        setGame("player2", false, { id: "a1", ownership: { player1: 3 } }, { messages: { get: () => ({ update: messageUpdate }) } });

        await handleDrainReroll("msg1", flag());
        await handleDrainBuy("msg1", flag());

        expect(messageUpdate).not.toHaveBeenCalled();
    });

    it("recomputes damage from baseline and persists through the message when authorized", async () => {
        const update = vi.fn().mockResolvedValue(undefined);
        const actor = { id: "a1", system: { karma: { karmaPool: { value: 5 }, karmaPoolCeiling: 5 } }, update };
        const messageUpdate = vi.fn();
        setGame("gm1", true, actor, { messages: { get: (id: string) => (id === "msg1" ? { update: messageUpdate } : undefined) } });
        (globalThis as Record<string, unknown>).Hooks = { callAll: vi.fn() };

        const naturalSuccessFlag = flag({ results: [{ result: 6 }], baseLevel: "l" });
        await handleDrainBuy("msg1", naturalSuccessFlag);

        expect(update).toHaveBeenCalled();
        expect(messageUpdate).toHaveBeenCalledWith(expect.objectContaining({
            content: expect.any(String),
            "flags.sr3e.drainOutcome": expect.objectContaining({
                results: expect.arrayContaining([expect.objectContaining({ bought: true })]),
            }),
        }));
    });

    it("only spends Karma Pool on reroll — never touches actor health", async () => {
        // Health is applied exactly once, via handleDrainDone, not on every
        // reroll/buy. Two sequential actor.update() calls per click (karma,
        // then health) was the actual cause of a lost-update bug in live
        // testing; removing the per-click health write removes it entirely.
        const actor = {
            id: "a1",
            system: { health: { stun: { value: 0 }, physical: { value: 0 }, overflow: { value: 0 } }, karma: { karmaPool: { value: 5 }, karmaPoolCeiling: 5 } },
            update: vi.fn().mockResolvedValue(undefined),
        };
        const messageUpdate = vi.fn().mockResolvedValue(undefined);
        setGame("gm1", true, actor, { messages: { get: (id: string) => (id === "msg1" ? { update: messageUpdate } : undefined) } });

        mockRoll([6, 6, 6]);
        await handleDrainReroll("msg1", flag({ results: [{ result: 1 }, { result: 2 }, { result: 3 }] }));

        expect(actor.update).toHaveBeenCalledTimes(1);
        expect(actor.update).toHaveBeenCalledWith({ "system.karma.karmaPool.value": 4 }, { render: false });
    });
});

describe("handleDrainDone", () => {
    it("applies health from baseline using the currently staged results, exactly once", async () => {
        const actor = {
            id: "a1",
            system: { health: { stun: { value: 0 }, physical: { value: 0 }, overflow: { value: 0 } } },
            update: vi.fn().mockResolvedValue(undefined),
        };
        setGame("gm1", true, actor);
        (globalThis as Record<string, unknown>).Hooks = { callAll: vi.fn(), on: vi.fn(() => 1), off: vi.fn() };

        // 2 successes -> Serious staged down to Moderate -> 3 boxes.
        const finalFlag = flag({ results: [{ result: 6 }, { result: 6 }] });
        await handleDrainDone(finalFlag);

        expect(actor.update).toHaveBeenCalledTimes(1);
        expect(actor.update).toHaveBeenCalledWith({
            "system.health.stun.value": 3,
            "system.health.physical.value": 0,
            "system.health.overflow.value": 0,
        });
    });

    it("does nothing when the clicking user is not authorized", async () => {
        const actor = { id: "a1", system: { health: { stun: { value: 0 }, physical: { value: 0 }, overflow: { value: 0 } } }, update: vi.fn() };
        setGame("player2", false, { ...actor, ownership: { player1: 3 } });

        await handleDrainDone(flag());

        expect(actor.update).not.toHaveBeenCalled();
    });
});

describe("applyDrainDelta (race safety)", () => {
    it("merges against the message's CURRENT persisted flag, not the stale fallback", async () => {
        const persisted = flag({ results: [{ result: 6 }], rerollCount: 1 });
        const update = vi.fn().mockResolvedValue(undefined);
        (globalThis as Record<string, unknown>).game = {
            user: { id: "gm1", isGM: true },
            messages: { get: () => ({ flags: { sr3e: { drainOutcome: persisted } }, update }) },
        };

        const staleFallback = flag(); // still shows the original [1, 2] results
        await applyDrainDelta("msg1", { results: [{ result: 6 }, { result: 4 }], rerollCount: 2 }, staleFallback);

        const written = update.mock.calls[0]?.[0]["flags.sr3e.drainOutcome"] as DrainOutcomeFlag;
        expect(written.results).toEqual([{ result: 6 }, { result: 4 }]);
        expect(written.rerollCount).toBe(2);
        // baseline/tn/track carried through unchanged from the persisted state, not the stale fallback
        expect(written.baseLevel).toBe(persisted.baseLevel);
    });

    it("serializes overlapping writes so the second sees the first's result", async () => {
        const state = { current: flag() };
        const update = vi.fn().mockImplementation(async (data: Record<string, unknown>) => {
            state.current = data["flags.sr3e.drainOutcome"] as DrainOutcomeFlag;
        });
        (globalThis as Record<string, unknown>).game = {
            user: { id: "gm1", isGM: true },
            messages: { get: () => ({ flags: { sr3e: { drainOutcome: state.current } }, update }) },
        };

        const first = applyDrainDelta("msg-race", { results: [{ result: 3 }], rerollCount: 1 }, flag());
        const second = applyDrainDelta("msg-race", { results: [{ result: 3 }, { result: 5 }], rerollCount: 2 }, flag());
        await Promise.all([first, second]);

        expect(state.current.results).toEqual([{ result: 3 }, { result: 5 }]);
        expect(state.current.rerollCount).toBe(2);
    });
});

describe("rerenderDrainMessage", () => {
    it("renders the success message when drain is fully staged off", () => {
        const html = rerenderDrainMessage(flag({ baseLevel: "l", results: [{ result: 6 }, { result: 6 }] }));
        expect(html).toContain("Your drain roll succeeded");
    });

    it("renders the damage message with the box count when drain isn't fully resisted", () => {
        const html = rerenderDrainMessage(flag({ results: [] }));
        expect(html).toContain("6 box");
        expect(html).toContain("stun damage");
    });
});
