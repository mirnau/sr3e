import { describe, it, expect } from "vitest";
import { buildDamagePacket } from "./damagePacket";
import type { AttackPlan, Directive } from "./damagePacket";

const weapon = (power: number, damageType = "m") => ({
    system: { power, damageType, levelDelta: 0 },
});

const plan = (overrides: Partial<AttackPlan> = {}): AttackPlan => ({
    roundsFired: 1,
    attackerTNMod: 0,
    powerDelta: 0,
    levelDelta: 0,
    notes: [],
    ...overrides,
});

describe("buildDamagePacket", () => {
    it("builds base packet from weapon", () => {
        const p = buildDamagePacket(weapon(8), plan());
        expect(p.power).toBe(8);
        expect(p.damageType).toBe("m");
        expect(p.armorUse).toBe("ballistic");
    });

    it("applies plan.powerDelta", () => {
        const p = buildDamagePacket(weapon(6), plan({ powerDelta: 2 }));
        expect(p.power).toBe(8);
    });

    it("damage.powerAdd directive", () => {
        const d: Directive[] = [{ k: "damage.powerAdd", v: 3 }];
        expect(buildDamagePacket(weapon(5), plan(), d).power).toBe(8);
    });

    it("armor.mult.ballistic stacks multiplicatively", () => {
        const d: Directive[] = [
            { k: "armor.mult.ballistic", v: 0.5 },
            { k: "armor.mult.ballistic", v: 0.5 },
        ];
        expect(buildDamagePacket(weapon(8), plan(), d).armorMult.ballistic).toBe(0.25);
    });

    it("special.* appends to notes", () => {
        const d: Directive[] = [{ k: "special.flechette", v: "flechette" }];
        expect(buildDamagePacket(weapon(8), plan(), d).notes).toContain("flechette");
    });

    it("armor.use override", () => {
        const d: Directive[] = [{ k: "armor.use", v: "impact" }];
        expect(buildDamagePacket(weapon(8), plan(), d).armorUse).toBe("impact");
    });

    it("unknown directive keys ignored", () => {
        const d: Directive[] = [{ k: "unknown.key", v: 99 }];
        const p = buildDamagePacket(weapon(8), plan(), d);
        expect(p.power).toBe(8);
    });
});
