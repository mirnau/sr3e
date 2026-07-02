import { describe, it, expect } from "vitest";
import { computeDefaulting } from "./defaultingRules";

const actor = (intValue = 4) => ({
    system: { attributes: { intelligence: { value: intValue, modifier: 0 } } },
});

const skill = (value = 3, noDefault = false, specs: number[] = []) => ({
    system: {
        value,
        noDefault,
        specializations: specs.map(v => ({ value: v })),
    },
});

describe("computeDefaulting", () => {
    it("attribute defaulting — no skill", () => {
        const r = computeDefaulting(null, null, "intelligence", actor(), 4, []);
        expect(r.mode).toBe("attribute");
        expect(r.dice).toBe(4);
        expect(r.mods[0]?.value).toBe(4);
        expect(r.mods[0]?.forbidPool).toBe(true);
    });

    it("skill defaulting", () => {
        const r = computeDefaulting(skill(4), null, null, actor(), 4, []);
        expect(r.mode).toBe("skill");
        expect(r.dice).toBe(4);
        expect(r.mods[0]?.value).toBe(2);
        expect(r.mods[0]?.poolCap).toBe(2); // floor(4/2)
    });

    it("specialization defaulting — rolls the specialization's own rating, pool capped by the base skill's", () => {
        const r = computeDefaulting(skill(4, false, [6]), 0, null, actor(), 4, []);
        expect(r.mode).toBe("specialization");
        expect(r.dice).toBe(6); // the specialization's own rating, not the base skill's (4)
        expect(r.mods[0]?.value).toBe(3);
        expect(r.mods[0]?.poolCap).toBe(2); // floor(base skill rating 4 / 2)
    });

    it("noDefault guard → none", () => {
        const r = computeDefaulting(skill(4, true), null, null, actor(), 4, []);
        expect(r.mode).toBe("none");
    });

    it("pre-default TN ≥ 8 guard → none", () => {
        const r = computeDefaulting(skill(4), null, null, actor(), 8, []);
        expect(r.mode).toBe("none");
    });

    it("none when no skill and no linkedAttr", () => {
        const r = computeDefaulting(null, null, null, actor(), 4, []);
        expect(r.mode).toBe("none");
    });
});
