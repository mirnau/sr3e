import { describe, it, expect } from "vitest";
import { currentEssence, wouldBeLethal } from "./essenceGate";

const actor = (value: number, mod = 0) => ({ system: { attributes: { essence: { value, mod } } } });

describe("currentEssence", () => {
    it("sums value and mod", () => {
        expect(currentEssence(actor(6, -1.5))).toBe(4.5);
    });

    it("defaults to 6 with no essence attribute set", () => {
        expect(currentEssence({ system: {} })).toBe(6);
    });
});

describe("wouldBeLethal", () => {
    it("blocks when the deduction would bring essence to exactly zero", () => {
        expect(wouldBeLethal(actor(2), 2)).toBe(true);
    });

    it("blocks when the deduction would bring essence below zero", () => {
        expect(wouldBeLethal(actor(1), 2)).toBe(true);
    });

    it("allows when essence stays above zero", () => {
        expect(wouldBeLethal(actor(6), 2)).toBe(false);
    });

    it("accounts for existing essence.mod from prior installs", () => {
        expect(wouldBeLethal(actor(6, -5), 1)).toBe(true);
    });
});
