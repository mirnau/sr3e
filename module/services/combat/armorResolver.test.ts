import { describe, it, expect } from "vitest";
import { computeEffectiveArmor } from "./armorResolver";
import type { DamagePacket } from "./damagePacket";

const basePacket = (): DamagePacket => ({
    power: 8, damageType: "m", levelDelta: 0,
    attackTNAdd: 0, resistTNAdd: 0,
    armorUse: "ballistic",
    armorMult: { ballistic: 1, impact: 1 },
    notes: [],
});

const defender = (pieces: Array<{ ballistic?: number; impact?: number }>) => ({
    items: {
        contents: pieces.map(armor => ({ system: { equipped: true, armor } })),
    },
});

describe("computeEffectiveArmor", () => {
    it("single piece", () => {
        const r = computeEffectiveArmor(defender([{ ballistic: 6 }]), basePacket());
        expect(r.ballisticBase).toBe(6);
        expect(r.effective).toBe(6);
    });

    it("two pieces layered — second halved", () => {
        // 6 + floor(4/2) = 6 + 2 = 8
        const r = computeEffectiveArmor(defender([{ ballistic: 6 }, { ballistic: 4 }]), basePacket());
        expect(r.ballisticBase).toBe(8);
    });

    it("zero armor", () => {
        const r = computeEffectiveArmor(defender([]), basePacket());
        expect(r.effective).toBe(0);
    });

    it("switches to impact", () => {
        const p = { ...basePacket(), armorUse: "impact" as const };
        const r = computeEffectiveArmor(defender([{ ballistic: 6, impact: 3 }]), p);
        expect(r.effective).toBe(3);
    });

    it("armorMult applied", () => {
        const p = { ...basePacket(), armorMult: { ballistic: 0.5, impact: 1 } };
        const r = computeEffectiveArmor(defender([{ ballistic: 8 }]), p);
        expect(r.effective).toBe(4);
    });
});
