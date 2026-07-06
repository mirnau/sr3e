import { describe, expect, it } from "vitest";
import { isPermanentNonStatusEffect, tokenIconEffects } from "./tokenEffectIcons";

describe("tokenEffectIcons", () => {
    it("hides permanent non-status effects from token effect icons", () => {
        expect(isPermanentNonStatusEffect({ duration: { units: "none" }, statuses: new Set() })).toBe(true);
        expect(isPermanentNonStatusEffect({ duration: {}, statuses: [] })).toBe(true);
    });

    it("keeps timed effects visible", () => {
        expect(isPermanentNonStatusEffect({ duration: { units: "seconds", seconds: 60 } })).toBe(false);
        expect(isPermanentNonStatusEffect({ duration: { rounds: 3 } })).toBe(false);
    });

    it("keeps status effects visible even without duration", () => {
        expect(isPermanentNonStatusEffect({ duration: { units: "none" }, statuses: new Set(["dead"]) })).toBe(false);
        expect(isPermanentNonStatusEffect({ duration: {}, statuses: ["prone"] })).toBe(false);
    });

    it("prefers the raw persisted duration over the live duration getter", () => {
        const effect = {
            duration: { units: "seconds", seconds: 60 },
            statuses: new Set<string>(),
            toObject: () => ({ duration: {} }),
        };
        expect(isPermanentNonStatusEffect(effect)).toBe(true);
    });

    it("filters only permanent non-status effects", () => {
        const permanent = { duration: { units: "none" }, statuses: new Set<string>() };
        const timed = { duration: { units: "turns", turns: 1 }, statuses: new Set<string>() };
        const status = { duration: {}, statuses: new Set(["dead"]) };

        expect(tokenIconEffects([permanent, timed, status])).toEqual([timed, status]);
    });
});
