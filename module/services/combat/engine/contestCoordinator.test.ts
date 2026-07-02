import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
    waitForResponse, deliverResponse, expireContest,
    countSuccesses, computeNetSuccesses, submitContestResponse, _resetForTest,
} from "./contestCoordinator";
import type { RollSnapshot } from "./types";

beforeEach(() => _resetForTest());

function roll(results: number[], tn: number): RollSnapshot {
    return {
        terms: [{ results: results.map(r => ({ active: true, result: r })) }],
        options: { targetNumber: tn },
        meta: { flavor: "", procedureKind: "test" },
    };
}

describe("countSuccesses", () => {
    it("counts hits at or above TN", () => expect(countSuccesses(roll([4, 5, 6, 3], 5))).toBe(2));
    it("zero hits", () => expect(countSuccesses(roll([1, 2, 3], 5))).toBe(0));
    it("all hits", () => expect(countSuccesses(roll([6, 6, 6], 4))).toBe(3));
});

describe("computeNetSuccesses", () => {
    it("attacker wins by 2", () => expect(computeNetSuccesses(roll([5, 6, 6, 3], 5), roll([5, 2], 5))).toBe(2));
    it("clamped at zero when defender wins", () => expect(computeNetSuccesses(roll([3], 5), roll([5, 6], 5))).toBe(0));
});

describe("waitForResponse / deliverResponse", () => {
    it("resolves with delivered roll", async () => {
        const promise = waitForResponse("c1");
        const r = roll([6], 4);
        deliverResponse("c1", r);
        expect(await promise).toBe(r);
    });

    it("deliver cleans up pending entry", async () => {
        const p = waitForResponse("c2");
        deliverResponse("c2", roll([5], 4));
        await p;
        // second deliver does not reject
        expect(() => deliverResponse("c2", roll([5], 4))).not.toThrow();
    });
});

describe("submitContestResponse", () => {
    afterEach(() => { delete (globalThis as Record<string, unknown>).game; });

    it("resolves the local pending promise (same-client case)", async () => {
        const promise = waitForResponse("c3");
        const r = roll([6], 4);
        submitContestResponse("c3", r);
        expect(await promise).toBe(r);
    });

    it("relays the response over the socket for other clients", () => {
        const emit = vi.fn();
        (globalThis as Record<string, unknown>).game = { socket: { emit } };
        const r = roll([6], 4);

        submitContestResponse("c4", r);

        expect(emit).toHaveBeenCalledWith("system.sr3e", { type: "contestResponse", contestId: "c4", roll: r });
    });

    it("does not throw when no socket is available", () => {
        expect(() => submitContestResponse("c5", roll([6], 4))).not.toThrow();
    });
});

describe("expireContest", () => {
    it("resolves waiting promise with abort sentinel", async () => {
        const p = waitForResponse("cx");
        expireContest("cx");
        const result = await p;
        expect(result.meta.procedureKind).toBe("__aborted");
    });
});
