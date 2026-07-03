import { describe, expect, it, vi, afterEach } from "vitest";
import { _resetForTest, applyPendingInterest, registerDebtInterestHook } from "./debtInterest";

afterEach(() => {
    _resetForTest();
    delete (globalThis as Record<string, unknown>).game;
    delete (globalThis as Record<string, unknown>).Hooks;
});

function debt(overrides: Record<string, unknown> = {}) {
    return {
        system: {
            amount: 1000,
            type: "debt",
            interestPerMonth: 10,
            lastInterestPeriod: "",
            ...overrides,
        },
    };
}

describe("applyPendingInterest", () => {
    it("returns null for non-debt transactions", () => {
        expect(applyPendingInterest(debt({ type: "expense" }), "2077-03")).toBeNull();
    });

    it("returns null when interestPerMonth is zero or negative", () => {
        expect(applyPendingInterest(debt({ interestPerMonth: 0 }), "2077-03")).toBeNull();
    });

    it("returns null when already caught up for the period", () => {
        expect(applyPendingInterest(debt({ lastInterestPeriod: "2077-03" }), "2077-03")).toBeNull();
    });

    it("baselines a freshly created debt without growing it", () => {
        expect(applyPendingInterest(debt({ lastInterestPeriod: "" }), "2077-03")).toEqual({
            amount: 1000,
            lastInterestPeriod: "2077-03",
        });
    });

    it("compounds across a single elapsed month", () => {
        const result = applyPendingInterest(debt({ lastInterestPeriod: "2077-02" }), "2077-03");
        expect(result?.amount).toBeCloseTo(1100);
        expect(result?.lastInterestPeriod).toBe("2077-03");
    });

    it("compounds across multiple skipped months", () => {
        const result = applyPendingInterest(debt({ lastInterestPeriod: "2077-01" }), "2077-04");
        expect(result?.amount).toBeCloseTo(1000 * 1.1 ** 3);
        expect(result?.lastInterestPeriod).toBe("2077-04");
    });
});

function debtItem(overrides: Record<string, unknown> = {}) {
    const item: any = {
        system: { amount: 1000, type: "debt", interestPerMonth: 10, lastInterestPeriod: "2077-02", ...overrides },
        update: vi.fn(async (data: Record<string, unknown>) => {
            item.system.amount = data["system.amount"];
            item.system.lastInterestPeriod = data["system.lastInterestPeriod"];
        }),
    };
    return item;
}

function setGame(isGM: boolean, worldTime: number, actors: Array<{ items: unknown[] }>) {
    (globalThis as Record<string, unknown>).game = { user: { isGM }, time: { worldTime }, actors };
}

function registerAndFireHook(): Promise<void> {
    let handler: (() => Promise<void>) | undefined;
    (globalThis as Record<string, unknown>).Hooks = { on: (_event: string, cb: () => Promise<void>) => { handler = cb; } };
    registerDebtInterestHook();
    return handler?.() ?? Promise.resolve();
}

const march2077 = new Date(2077, 2, 1).getTime();

describe("registerDebtInterestHook", () => {
    it("does nothing on a non-GM client", async () => {
        const item = debtItem();
        setGame(false, march2077, [{ items: [item] }]);

        await registerAndFireHook();

        expect(item.update).not.toHaveBeenCalled();
    });

    it("compounds interest across every actor's debts on the GM's client", async () => {
        const item = debtItem();
        setGame(true, march2077, [{ items: [item] }]);

        await registerAndFireHook();

        expect(item.update).toHaveBeenCalledWith(expect.objectContaining({ "system.lastInterestPeriod": "2077-03" }));
        expect(item.system.amount).toBeCloseTo(1100);
    });

    it("only processes each rolled-over period once", async () => {
        const item = debtItem();
        setGame(true, march2077, [{ items: [item] }]);

        let handler: (() => Promise<void>) | undefined;
        (globalThis as Record<string, unknown>).Hooks = { on: (_event: string, cb: () => Promise<void>) => { handler = cb; } };
        registerDebtInterestHook();

        await handler?.();
        await handler?.();

        expect(item.update).toHaveBeenCalledTimes(1);
    });
});
