import { describe, it, expect } from "vitest";
import { buildFormula, buildInfiniteFormula, buildInitiativeFormula, computeFinalTN, computePoolDice } from "./diceFormula";
import type { RollState } from "./diceFormula";

const state = (overrides: Partial<RollState> = {}): RollState => ({
    dice: 4, poolDice: 2, karmaDice: 0, targetNumber: 5, modifiers: [], ...overrides,
});

describe("buildFormula", () => {
    it("emits Nd6x{TN} with computed TN", () => expect(buildFormula(state())).toBe("6d6x5"));
    it("TN floored at 2", () => expect(buildFormula(state({ targetNumber: 1, modifiers: [{ name: "neg", value: -2 }] }))).toBe("6d6x2"));
    it("TN includes modifiers", () => expect(buildFormula(state({ targetNumber: 4, modifiers: [{ name: "range", value: 3 }] }))).toBe("6d6x7"));
    it("total ≤ 0 → 0d6", () => expect(buildFormula(state({ dice: 0, poolDice: 0 }))).toBe("0d6"));
    it("pool forbidden → pool excluded from total", () => {
        const s = state({ modifiers: [{ name: "default", value: 0, forbidPool: true }] });
        expect(buildFormula(s)).toBe("4d6x5");
    });
});

describe("buildInfiniteFormula", () => {
    it("emits Nd6x (no cap)", () => expect(buildInfiniteFormula(6)).toBe("6d6x"));
    it("pool ≤ 0 → 0d6", () => expect(buildInfiniteFormula(0)).toBe("0d6"));
});

describe("buildInitiativeFormula", () => {
    it("emits Nd6 (no modifier)", () => expect(buildInitiativeFormula(3)).toBe("3d6"));
    it("pool ≤ 0 → 0d6", () => expect(buildInitiativeFormula(0)).toBe("0d6"));
});

describe("computeFinalTN", () => {
    it("base + mods", () => {
        const s = state({ targetNumber: 4, modifiers: [{ name: "range", value: 2 }] });
        expect(computeFinalTN(s)).toBe(6);
    });
    it("floor applied", () => {
        const s = state({ targetNumber: 2, modifiers: [{ name: "neg", value: -3 }] });
        expect(computeFinalTN(s, 2)).toBe(2);
    });
});

describe("computePoolDice", () => {
    it("capped by poolCap mod", () => {
        const s = state({ poolDice: 5, modifiers: [{ name: "cap", value: 0, poolCap: 2 }] });
        expect(computePoolDice(s, 5)).toBe(2);
    });
    it("capped by available", () => expect(computePoolDice(state({ poolDice: 5 }), 3)).toBe(3));
    it("zero when forbidden", () => {
        const s = state({ modifiers: [{ name: "x", value: 0, forbidPool: true }] });
        expect(computePoolDice(s, 10)).toBe(0);
    });
});
