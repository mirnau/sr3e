import { describe, it, expect } from "vitest";
import { planStrike, prepareMeleeResistance } from "./meleeFamily";

const attacker = (str: number) => ({
    system: { attributes: { strength: { value: str, total: str } } },
});

const weapon = (bonus: number, damageType = "m") => ({
    system: { damage: bonus, damageType, power: 0 },
});

const defender = () => ({
    system: {},
    items: { contents: [] },
});

describe("planStrike", () => {
    it("power = STR + weapon bonus", () => {
        const p = planStrike(attacker(4), weapon(2));
        expect(p.power).toBe(6);
    });
    it("armor type forced to impact", () => {
        const p = planStrike(attacker(4), weapon(2));
        expect(p.armorUse).toBe("impact");
    });
    it("called shot adds level delta and note", () => {
        const p = planStrike(attacker(4), weapon(2), { calledShot: true, calledShotStages: 2 });
        expect(p.levelDelta).toBe(2);
        expect(p.notes).toContain("called-shot");
    });
    it("no called shot — no note", () => {
        const p = planStrike(attacker(4), weapon(2));
        expect(p.notes).not.toContain("called-shot");
    });
    it("uses .total for STR when available", () => {
        const a = { system: { attributes: { strength: { value: 3, total: 5 } } } };
        expect(planStrike(a, weapon(1)).power).toBe(6);
    });
});

describe("prepareMeleeResistance", () => {
    it("returns a ResistanceBuild", () => {
        const packet = planStrike(attacker(4), weapon(2));
        const build = prepareMeleeResistance(defender() as never, packet);
        expect(build).toHaveProperty("trackKey");
        expect(build).toHaveProperty("tnBase");
    });
});
