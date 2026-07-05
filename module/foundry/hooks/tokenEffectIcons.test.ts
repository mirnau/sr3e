import { describe, expect, it } from "vitest";
import { isPermanentNonStatusEffect, tokenIconEffects } from "./tokenEffectIcons";

describe("tokenEffectIcons", () => {
    it("hides permanent non-status effects from token effect icons", () => {
        expect(isPermanentNonStatusEffect({ duration: { type: "none" }, statuses: new Set() })).toBe(true);
        expect(isPermanentNonStatusEffect({ duration: {}, statuses: [] })).toBe(true);
    });

    it("keeps timed effects visible", () => {
        expect(isPermanentNonStatusEffect({ duration: { type: "seconds", seconds: 60 } })).toBe(false);
        expect(isPermanentNonStatusEffect({ duration: { rounds: 3 } })).toBe(false);
    });

    it("keeps status effects visible even without duration", () => {
        expect(isPermanentNonStatusEffect({ duration: { type: "none" }, statuses: new Set(["dead"]) })).toBe(false);
        expect(isPermanentNonStatusEffect({ duration: {}, statuses: ["prone"] })).toBe(false);
    });

    it("filters only permanent non-status effects", () => {
        const permanent = { duration: { type: "none" }, statuses: new Set<string>() };
        const timed = { duration: { type: "turns", turns: 1 }, statuses: new Set<string>() };
        const status = { duration: {}, statuses: new Set(["dead"]) };

        expect(tokenIconEffects([permanent, timed, status])).toEqual([timed, status]);
    });
});
