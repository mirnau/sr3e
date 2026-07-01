import { describe, it, expect } from "vitest";
import { upsertMod, removeMod, sumMods, poolCap, poolForbidden } from "./modifierList";
import type { Modifier } from "./modifierList";

const mod = (name: string, value: number, extra?: Partial<Modifier>): Modifier =>
    ({ name, value, ...extra });

describe("upsertMod", () => {
    it("appends when no match", () => {
        const result = upsertMod([mod("a", 1)], mod("b", 2));
        expect(result).toHaveLength(2);
    });
    it("replaces by id", () => {
        const result = upsertMod([mod("a", 1, { id: "x" })], mod("a", 9, { id: "x" }));
        expect(result).toHaveLength(1);
        expect(result[0]!.value).toBe(9);
    });
    it("replaces by name when no id", () => {
        const result = upsertMod([mod("a", 1)], mod("a", 5));
        expect(result).toHaveLength(1);
        expect(result[0]!.value).toBe(5);
    });
    it("is immutable", () => {
        const original = [mod("a", 1)];
        upsertMod(original, mod("a", 2));
        expect(original[0]!.value).toBe(1);
    });
});

describe("removeMod", () => {
    it("removes by id", () => {
        const result = removeMod([mod("a", 1, { id: "x" }), mod("b", 2, { id: "y" })], "x");
        expect(result).toHaveLength(1);
        expect(result[0]!.name).toBe("b");
    });
    it("removes by name when modifier has no id", () => {
        const result = removeMod([mod("out-of-range", 999), mod("b", 2, { id: "y" })], "out-of-range");
        expect(result).toHaveLength(1);
        expect(result[0]!.name).toBe("b");
    });
    it("does not remove when neither id nor name matches", () => {
        const result = removeMod([mod("a", 1), mod("b", 2)], "x");
        expect(result).toHaveLength(2);
    });
});

describe("sumMods", () => {
    it("sums values", () => expect(sumMods([mod("a", 2), mod("b", 3)])).toBe(5));
    it("returns 0 for empty", () => expect(sumMods([])).toBe(0));
});

describe("poolCap", () => {
    it("returns Infinity with no caps", () => expect(poolCap([mod("a", 1)])).toBe(Infinity));
    it("returns min cap", () => {
        expect(poolCap([mod("a", 0, { poolCap: 4 }), mod("b", 0, { poolCap: 2 })])).toBe(2);
    });
});

describe("poolForbidden", () => {
    it("false when none forbidden", () => expect(poolForbidden([mod("a", 1)])).toBe(false));
    it("true when any forbidden", () => {
        expect(poolForbidden([mod("a", 1), mod("b", 0, { forbidPool: true })])).toBe(true);
    });
});
