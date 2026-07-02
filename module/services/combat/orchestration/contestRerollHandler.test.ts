import { describe, expect, it, vi, afterEach } from "vitest";
import { applyContestSideDelta, canActOnContestSide, handleContestBuy, handleContestReroll, rerenderContestMessage, type ContestOutcomeFlag } from "./contestRerollHandler";

function side(overrides: Record<string, unknown> = {}) {
    return {
        actorId: "actor1",
        actorName: "Attacker",
        options: { targetNumber: 4 },
        meta: { flavor: "Attack", procedureKind: "firearm" },
        results: [{ result: 6 }, { result: 2 }],
        rerollCount: 0,
        done: false,
        ...overrides,
    };
}

function flag(overrides: Partial<ContestOutcomeFlag> = {}): ContestOutcomeFlag {
    return {
        contestId: "contest:test",
        weaponName: "Predator",
        exportCtx: { familyKey: "firearm", weaponId: null, weaponName: "Predator", plan: null, damage: null, tnBase: 4, tnMods: [], next: { kind: "", ui: {}, args: {} } },
        initiator: side({ actorId: "initiator1", actorName: "Attacker" }),
        target: side({ actorId: "target1", actorName: "Defender" }),
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

function mockRoll(results: number[]) {
    class MockRoll {
        terms = [{ results: results.map(r => ({ result: r, active: true })) }];
        async evaluate() { return this; }
    }
    (globalThis as Record<string, unknown>).Roll = MockRoll;
}

afterEach(() => {
    delete (globalThis as Record<string, unknown>).game;
    delete (globalThis as Record<string, unknown>).Roll;
});

describe("canActOnContestSide", () => {
    it("allows a GM regardless of who owns the actor", () => {
        setGame("gm1", true, null);
        expect(canActOnContestSide(side())).toBe(true);
    });

    it("allows the actor's controlling player", () => {
        const actor = { id: "actor1", ownership: { player1: 3 } };
        setGame("player1", false, actor);
        expect(canActOnContestSide(side())).toBe(true);
    });

    it("denies a player who does not control the actor", () => {
        const actor = { id: "actor1", ownership: { player1: 3 } };
        setGame("player2", false, actor);
        expect(canActOnContestSide(side())).toBe(false);
    });
});

describe("handleContestReroll / handleContestBuy authorization", () => {
    it("does not persist anything when the clicking user is not authorized", async () => {
        const actor = { id: "target1", ownership: { player1: 3 } };
        const update = vi.fn();
        setGame("player2", false, actor, { socket: { emit: vi.fn() }, messages: { get: () => ({ update }) } });

        await handleContestReroll("msg1", flag(), "target");
        await handleContestBuy("msg1", flag(), "target");

        expect(update).not.toHaveBeenCalled();
    });

    it("persists a buy through the real message id when the GM (the message author) clicks", async () => {
        const targetActor = {
            id: "target1",
            system: { karma: { karmaPool: { value: 5 }, karmaPoolCeiling: 5 } },
            update: vi.fn().mockResolvedValue(undefined),
        };
        const update = vi.fn();
        setGame("gm1", true, targetActor, { messages: { get: (id: string) => (id === "msg1" ? { update } : undefined) } });

        await handleContestBuy("msg1", flag(), "target");

        expect(update).toHaveBeenCalledWith(expect.objectContaining({
            content: expect.any(String),
            "flags.sr3e.contestOutcome": expect.objectContaining({
                target: expect.objectContaining({ results: expect.arrayContaining([expect.objectContaining({ bought: true })]) }),
            }),
        }));
    });

    it("persists a buy for the GM's OWN (initiator) side, not just the opponent's", async () => {
        const initiatorActor = {
            id: "initiator1",
            system: { karma: { karmaPool: { value: 5 }, karmaPoolCeiling: 5 } },
            update: vi.fn().mockResolvedValue(undefined),
        };
        const update = vi.fn().mockResolvedValue(undefined);
        setGame("gm1", true, initiatorActor, { messages: { get: (id: string) => (id === "msg1" ? { update } : undefined) } });

        await handleContestBuy("msg1", flag(), "initiator");

        expect(initiatorActor.update).toHaveBeenCalled();
        expect(update).toHaveBeenCalledWith(expect.objectContaining({
            "flags.sr3e.contestOutcome": expect.objectContaining({
                initiator: expect.objectContaining({ results: expect.arrayContaining([expect.objectContaining({ bought: true })]) }),
            }),
        }));
    });

    it("persists a reroll for the GM's OWN (initiator) side across repeated clicks", async () => {
        const initiatorActor = {
            id: "initiator1",
            system: { karma: { karmaPool: { value: 5 }, karmaPoolCeiling: 5 } },
            update: vi.fn().mockResolvedValue(undefined),
        };
        const update = vi.fn().mockResolvedValue(undefined);
        setGame("gm1", true, initiatorActor, { messages: { get: (id: string) => (id === "msg1" ? { update } : undefined) } });
        mockRoll([5]);

        await handleContestReroll("msg1", flag(), "initiator");
        expect(update).toHaveBeenCalledTimes(1);

        // Second attempt: a fresh flag with rerollCount=1 (as if the prior write
        // had landed) and a guaranteed still-failing die — independent of the
        // first call's actual random roll outcome, so this isn't flaky.
        const secondAttemptFlag = flag({ initiator: side({ actorId: "initiator1", actorName: "Attacker", results: [{ result: 6 }, { result: 1 }], rerollCount: 1 }) });
        await handleContestReroll("msg1", secondAttemptFlag, "initiator");
        expect(update).toHaveBeenCalledTimes(2);
    });
});

describe("applyContestSideDelta (race safety)", () => {
    it("merges against the message's CURRENT persisted flag, not the stale fallback, so a concurrent write to the other side survives", async () => {
        // Server-side state already has the target side rerolled to a fresh
        // set of results (e.g. from a write that landed a moment earlier) —
        // this must be what the merge builds on, not `fallback`, which still
        // shows the target's original stale results.
        const persisted = flag({ target: side({ actorId: "target1", actorName: "Defender", results: [{ result: 5 }, { result: 5 }], rerollCount: 1 }) });
        const update = vi.fn().mockResolvedValue(undefined);
        (globalThis as Record<string, unknown>).game = {
            user: { id: "gm1", isGM: true },
            messages: { get: () => ({ flags: { sr3e: { contestOutcome: persisted } }, update }) },
        };

        const staleFallback = flag(); // target still shows its original [6, 2] results here
        await applyContestSideDelta("msg1", { side: "initiator", results: [{ result: 4 }], rerollCount: 1 }, staleFallback);

        const written = update.mock.calls[0]?.[0]["flags.sr3e.contestOutcome"] as ContestOutcomeFlag;
        expect(written.initiator.results).toEqual([{ result: 4 }]);
        expect(written.target.results).toEqual([{ result: 5 }, { result: 5 }]); // preserved from persisted, not reverted to stale
    });

    it("serializes overlapping writes so the second sees the first's result", async () => {
        const state = { current: flag() };
        const update = vi.fn().mockImplementation(async (data: Record<string, unknown>) => {
            state.current = data["flags.sr3e.contestOutcome"] as ContestOutcomeFlag;
        });
        (globalThis as Record<string, unknown>).game = {
            user: { id: "gm1", isGM: true },
            messages: { get: () => ({ flags: { sr3e: { contestOutcome: state.current } }, update }) },
        };

        const first = applyContestSideDelta("msg-race", { side: "initiator", results: [{ result: 1 }], rerollCount: 1 }, flag());
        const second = applyContestSideDelta("msg-race", { side: "target", results: [{ result: 2 }], rerollCount: 1 }, flag());
        await Promise.all([first, second]);

        expect(state.current.initiator.results).toEqual([{ result: 1 }]);
        expect(state.current.target.results).toEqual([{ result: 2 }]);
    });
});

describe("rerenderContestMessage", () => {
    it("recomputes net successes and renders both sides", () => {
        const html = rerenderContestMessage(flag());
        expect(html).toContain("Attacker");
        expect(html).toContain("Defender");
        expect(html).toContain('data-side="initiator"');
        expect(html).toContain('data-side="target"');
    });
});
