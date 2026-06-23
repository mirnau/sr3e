import { describe, it, expect } from "vitest";
import { resolveRange, rangeModifier, rangeTNDelta } from "./rangeService";

const weapon = (ranges: { short?: number; medium?: number; long?: number; extreme?: number; minimumRange?: number }) =>
    ({ system: ranges });

const at = (d: number) => {
    const measure = () => ({ distance: d });
    return { attackerToken: { x: 0, y: 0 }, targetToken: { x: d, y: 0 }, measure };
};

describe("resolveRange", () => {
    const w = weapon({ short: 10, medium: 30, long: 60, extreme: 100 });

    it("resolves short band", () => {
        const { measure, attackerToken, targetToken } = at(5);
        const r = resolveRange(w, attackerToken, targetToken, 0, measure);
        expect(r.band).toBe("short");
        expect(r.baseTN).toBe(4);
    });

    it("resolves extreme band", () => {
        const { measure, attackerToken, targetToken } = at(90);
        const r = resolveRange(w, attackerToken, targetToken, 0, measure);
        expect(r.band).toBe("extreme");
        expect(r.baseTN).toBe(9);
    });

    it("out of range returns null baseTN", () => {
        const { measure, attackerToken, targetToken } = at(150);
        const r = resolveRange(w, attackerToken, targetToken, 0, measure);
        expect(r.band).toBeNull();
        expect(r.baseTN).toBeNull();
    });

    it("left-shift moves band toward short", () => {
        const { measure, attackerToken, targetToken } = at(40); // long
        const r = resolveRange(w, attackerToken, targetToken, 2, measure);
        expect(r.rawBand).toBe("long");
        expect(r.band).toBe("short");
    });

    it("left-shift clamps at short", () => {
        const { measure, attackerToken, targetToken } = at(5); // short, shift 5
        const r = resolveRange(w, attackerToken, targetToken, 5, measure);
        expect(r.band).toBe("short");
    });

    it("minimum range violation returns null", () => {
        const wMin = weapon({ short: 10, medium: 30, long: 60, extreme: 100, minimumRange: 5 });
        const { measure, attackerToken, targetToken } = at(3);
        const r = resolveRange(wMin, attackerToken, targetToken, 0, measure);
        expect(r.baseTN).toBeNull();
    });
});

describe("rangeModifier", () => {
    it("null for short", () => expect(rangeModifier({ distance: 5, rawBand: "short", band: "short", baseTN: 4 })).toBeNull());
    it("value 999 for out of range", () => expect(rangeModifier({ distance: 999, rawBand: null, band: null, baseTN: null })?.value).toBe(999));
    it("correct delta for medium", () => expect(rangeModifier({ distance: 20, rawBand: "medium", band: "medium", baseTN: 5 })?.value).toBe(1));
});

describe("rangeTNDelta", () => {
    it("short=0, medium=1, long=2, extreme=5", () => {
        expect(rangeTNDelta("short")).toBe(0);
        expect(rangeTNDelta("medium")).toBe(1);
        expect(rangeTNDelta("long")).toBe(2);
        expect(rangeTNDelta("extreme")).toBe(5);
    });
});
