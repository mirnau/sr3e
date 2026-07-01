import { describe, it, expect, vi } from "vitest";
import { buildResistanceSetup } from "./resistanceSetup";
import type { ResistancePrep } from "../engine/types";

const prep = (tnBase = 6, tnMods: { name: string; value: number }[] = []): ResistancePrep => ({
    familyKey: "firearm",
    weaponId: null,
    weaponName: "Predator",
    tnBase,
    tnMods,
    stagedStepBeforeResist: "m",
    trackKey: "physical",
    boxesIfUnresisted: 4,
});

const defender = (body = 4, currentBoxes = 0) => ({
    system: {
        attributes: { body: { value: body, total: body } },
        health: { physical: { boxes: currentBoxes }, stun: { boxes: 0 } },
    },
    items: { contents: [] },
    update: vi.fn().mockResolvedValue(undefined),
});

const roll = (results: number[], tn: number) => ({
    terms: [{ results: results.map(r => ({ active: true, result: r })) }],
    options: { targetNumber: tn },
    meta: { flavor: "", procedureKind: "resistance" },
});

describe("buildResistanceSetup", () => {
    it("dice from body total", () => {
        expect(buildResistanceSetup(defender(5), prep()).rollState.dice).toBe(5);
    });
    it("dice minimum 1 when body is 0", () => {
        expect(buildResistanceSetup(defender(0), prep()).rollState.dice).toBe(1);
    });
    it("TN from prep.tnBase", () => {
        expect(buildResistanceSetup(defender(), prep(7)).rollState.targetNumber).toBe(7);
    });
    it("prep.tnMods present in rollState with source=armor", () => {
        const s = buildResistanceSetup(defender(), prep(6, [{ name: "hardened-armor", value: -2 }]));
        const mod = s.rollState.modifiers.find(m => m.name === "hardened-armor");
        expect(mod).toBeDefined();
        expect((mod as Record<string, unknown>).source).toBe("armor");
    });
    it("lockPriority advanced", () => {
        expect(buildResistanceSetup(defender(), prep()).lockPriority).toBe("advanced");
    });
    it("commitFn calls actor.update when damage applied", async () => {
        const d = defender(4, 0);
        const s = buildResistanceSetup(d, prep(4));
        // Roll with 0 successes → full M damage = 3 boxes
        await s.commitFn(roll([1, 2, 3, 4], 4), null);
        expect(d.update).toHaveBeenCalled();
    });
    it("commitFn does not update when damage staged off", async () => {
        const d = defender(4, 0);
        const s = buildResistanceSetup(d, prep(4));
        // Roll with 6 successes → damage staged below L → null → no update
        await s.commitFn(roll([5, 6, 5, 6, 5, 6], 4), null);
        expect(d.update).not.toHaveBeenCalled();
    });
});
