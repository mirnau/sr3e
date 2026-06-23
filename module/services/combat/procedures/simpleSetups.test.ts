import { describe, it, expect } from "vitest";
import { buildSkillSetup, buildAttributeSetup } from "./simpleSetups";

const skill = (id: string, value: number, specs: Array<{ value?: number; name?: string }> = [], attr = "agility") => ({
    id, type: "skill",
    system: { value, linkedAttribute: attr, specializations: specs },
});

const actor = (skills: ReturnType<typeof skill>[], attrs: Record<string, { value: number; total?: number }> = {}) => ({
    system: { attributes: { agility: { value: 5, total: 5 }, reaction: { value: 4, total: 4 }, ...attrs } },
    items: {
        get: (id: string) => skills.find(i => i.id === id),
        contents: skills,
    },
});

describe("buildSkillSetup", () => {
    it("dice from skill value", () => {
        const a = actor([skill("s1", 4)]);
        const s = buildSkillSetup(a, "s1");
        expect(s.rollState.dice).toBe(4);
    });
    it("TN from linked attribute", () => {
        const a = actor([skill("s1", 4, [], "reaction")]);
        const s = buildSkillSetup(a, "s1");
        expect(s.rollState.targetNumber).toBe(4); // reaction total=4
    });
    it("lockPriority is simple", () => {
        expect(buildSkillSetup(actor([skill("s1", 4)]), "s1").lockPriority).toBe("simple");
    });
    it("selfPublish true", () => {
        expect(buildSkillSetup(actor([skill("s1", 4)]), "s1").selfPublish).toBe(true);
    });
    it("spec with own value — no defaulting mod", () => {
        const a = actor([skill("s1", 4, [{ value: 6 }])]);
        const s = buildSkillSetup(a, "s1", 0);
        expect(s.rollState.dice).toBe(6);
        expect(s.rollState.modifiers).toHaveLength(0);
    });
    it("spec without own value — poolCap mod added", () => {
        const a = actor([skill("s1", 4, [{ name: "Pistols" }])]);
        const s = buildSkillSetup(a, "s1", 0);
        expect(s.rollState.modifiers.some(m => m.poolCap !== undefined)).toBe(true);
    });
    it("commitFn is no-op", async () => {
        const s = buildSkillSetup(actor([skill("s1", 4)]), "s1");
        await expect(s.commitFn(null, null)).resolves.toBeUndefined();
    });
});

describe("buildAttributeSetup", () => {
    it("dice from attribute total", () => {
        const a = actor([], { strength: { value: 3, total: 5 } });
        expect(buildAttributeSetup(a, "strength").rollState.dice).toBe(5);
    });
    it("dice falls back to value if no total", () => {
        const a = actor([], { strength: { value: 3 } });
        expect(buildAttributeSetup(a, "strength").rollState.dice).toBe(3);
    });
    it("TN always 4", () => {
        expect(buildAttributeSetup(actor([]), "reaction").rollState.targetNumber).toBe(4);
    });
    it("lockPriority simple", () => {
        expect(buildAttributeSetup(actor([]), "reaction").lockPriority).toBe("simple");
    });
});
