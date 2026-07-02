import { describe, expect, it } from "vitest";
import { applyPendingInterest } from "./debtInterest";

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
