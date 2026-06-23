import { describe, it, expect, afterEach } from "vitest";
import { SR3ERoll } from "./SR3ERoll";

function mockRoll(results: number[]) {
    class MockRoll {
        terms = [{ results: results.map(r => ({ result: r, active: true })) }];
        async evaluate() { return this; }
    }
    (globalThis as Record<string, unknown>).Roll = MockRoll;
}

afterEach(() => { delete (globalThis as Record<string, unknown>).Roll; });

describe("SR3ERoll.build", () => {
    it("formula is Nd6x{TN}", () => expect(SR3ERoll.build(4, 5).formula).toBe("4d6x5"));
    it("zero pool → 0d6x{TN}", () => expect(SR3ERoll.build(0, 5).formula).toBe("0d6x5"));
    it("stores targetNumber in options", () => expect(SR3ERoll.build(4, 5).options.targetNumber).toBe(5));
});

describe("SR3ERoll.buildOpen", () => {
    it("formula is Nd6x (no cap)", () => expect(SR3ERoll.buildOpen(6).formula).toBe("6d6x"));
    it("targetNumber is null", () => expect(SR3ERoll.buildOpen(4).options.targetNumber).toBeNull());
});

describe("countSuccesses", () => {
    it("counts accumulated results >= TN", async () => {
        mockRoll([3, 5, 6, 4, 2]);
        const r = await SR3ERoll.build(5, 5).evaluate();
        expect(r.countSuccesses()).toBe(2);
    });
    it("returns null for open roll", async () => {
        mockRoll([5, 6, 3]);
        const r = await SR3ERoll.buildOpen(3).evaluate();
        expect(r.countSuccesses()).toBeNull();
    });
    it("zero successes", async () => {
        mockRoll([1, 2, 3]);
        expect((await SR3ERoll.build(3, 4).evaluate()).countSuccesses()).toBe(0);
    });
    it("accumulated result (e.g. 9) counts if >= TN", async () => {
        mockRoll([9, 3]);
        expect((await SR3ERoll.build(2, 5).evaluate()).countSuccesses()).toBe(1);
    });
});

describe("isGlitch", () => {
    it("all ones → glitch", async () => {
        mockRoll([1, 1, 1]);
        expect((await SR3ERoll.build(3, 4).evaluate()).isGlitch()).toBe(true);
    });
    it("mixed → not a glitch", async () => {
        mockRoll([1, 1, 5]);
        expect((await SR3ERoll.build(3, 4).evaluate()).isGlitch()).toBe(false);
    });
    it("no dice → not a glitch", async () => {
        mockRoll([]);
        expect((await SR3ERoll.build(0, 4).evaluate()).isGlitch()).toBe(false);
    });
    it("open roll → never a glitch", async () => {
        mockRoll([1, 1, 1]);
        expect((await SR3ERoll.buildOpen(3).evaluate()).isGlitch()).toBe(false);
    });
});

describe("toSnapshot", () => {
    it("includes targetNumber in options", async () => {
        mockRoll([5]);
        const snap = (await SR3ERoll.build(1, 4).evaluate()).toSnapshot();
        expect(snap.options.targetNumber).toBe(4);
    });
    it("null TN in open roll snapshot", async () => {
        mockRoll([5, 3]);
        const snap = (await SR3ERoll.buildOpen(2).evaluate()).toSnapshot();
        expect(snap.options.targetNumber).toBeNull();
    });
});
