import { describe, expect, it } from "vitest";
import { renderSpellDamageStaging, spellDamageStaging } from "./spellCombat";
import type { ContestExport, RollSnapshot } from "../combat/engine/types";

function roll(successes: number): RollSnapshot {
    return {
        terms: [{ results: Array.from({ length: successes }, () => ({ result: 5, active: true })) }],
        options: { targetNumber: 4 },
        meta: { flavor: "", procedureKind: "spellcasting" },
    };
}

function ctx(args: Record<string, unknown>): ContestExport {
    return {
        familyKey: "spellcasting",
        weaponId: null,
        weaponName: "Manabolt",
        plan: null,
        damage: null,
        tnBase: 4,
        tnMods: [],
        next: { kind: "spell-resistance", ui: {}, args },
    };
}

describe("spellDamageStaging", () => {
    it("stages combat spells by net successes", () => {
        const result = spellDamageStaging(ctx({ spellCategory: "combat", damageLevel: "m" }), roll(4), roll(0));
        expect(result?.final).toBe("d");
    });

    it("stages elemental manipulations up then down", () => {
        const result = spellDamageStaging(ctx({ spellCategory: "manipulation", manipulationSubtype: "elemental", damageLevel: "m" }), roll(4), roll(2));
        expect(result?.final).toBe("s");
    });

    it("renders no damage below Light", () => {
        const html = renderSpellDamageStaging({ base: "l", final: null, casterSuccesses: 0, resistanceSuccesses: 2, kind: "elemental" });
        expect(html).toContain("No Damage");
    });
});
