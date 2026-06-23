import { describe, it, expect } from "vitest";
import { buildResistance, resolveResistance } from "./resistanceEngine";
import type { DamagePacket } from "./damagePacket";

const basePacket = (overrides: Partial<DamagePacket> = {}): DamagePacket => ({
    power: 8, damageType: "m", levelDelta: 0,
    attackTNAdd: 0, resistTNAdd: 0,
    armorUse: "ballistic",
    armorMult: { ballistic: 1, impact: 1 },
    notes: [],
    ...overrides,
});

const defender = (ballistic = 0, impact = 0) => ({
    items: {
        contents: ballistic === 0 && impact === 0 ? [] : [
            { system: { equipped: true, armor: { ballistic, impact } } },
        ],
    },
});

describe("buildResistance", () => {
    it("standard physical — correct TN and track", () => {
        const build = buildResistance(defender(4), basePacket(), 0);
        expect(build.trackKey).toBe("physical");
        expect(build.tn).toBe(4); // max(2, 8 - 4)
    });

    it("stun track from damageType", () => {
        const build = buildResistance(defender(4), basePacket({ damageType: "mstun" }), 0);
        expect(build.trackKey).toBe("stun");
    });

    it("TN floor at 2", () => {
        const build = buildResistance(defender(20), basePacket(), 0);
        expect(build.tn).toBe(2);
    });

    it("flechette unarmored — step staged up", () => {
        const build = buildResistance(defender(0, 0), basePacket({ notes: ["flechette"] }), 0);
        expect(build.armor.armorType).toBe("flechette-unarmored");
        expect(build.stagedStepBeforeResist).toBe("s"); // m staged up by 1 → s
    });

    it("flechette armored — max(ballistic, 2×impact)", () => {
        // ballistic=4, impact=3 → max(4, 6) = 6
        const build = buildResistance(defender(4, 3), basePacket({ notes: ["flechette"] }), 0);
        expect(build.armor.armorType).toBe("flechette");
        expect(build.armor.effective).toBe(6);
    });
});

describe("resolveResistance", () => {
    it("staged off returns applied=false, boxes=0", () => {
        const build = buildResistance(defender(4), basePacket({ damageType: "l" }), 0);
        const result = resolveResistance(build, 6); // 6 body → −3 stages, staged off
        expect(result.applied).toBe(false);
        expect(result.boxes).toBe(0);
    });

    it("surviving damage returns correct boxes", () => {
        const build = buildResistance(defender(0), basePacket({ damageType: "s" }), 0);
        const result = resolveResistance(build, 0);
        expect(result.applied).toBe(true);
        expect(result.boxes).toBe(6);
    });
});
