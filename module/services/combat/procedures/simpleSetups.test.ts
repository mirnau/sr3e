import { describe, it, expect } from "vitest";
import { buildSkillSetup, buildAttributeSetup } from "./simpleSetups";

const skill = (id: string, value: number, specs: Array<{ value?: number; name?: string }> = [], attr = "agility", name?: string) => ({
    id, name, type: "skill",
    system: { skillType: "active", activeSkill: { value, linkedAttribute: attr, specializations: specs } },
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

    // Challenges rely on a real TN roll (compare successes vs TN) — an open
    // roll (no TN) can't be net-successed against an opponent's roll.
    it("is a TN roll, not an open roll — required for challenge contests to count successes", () => {
        const s = buildSkillSetup(actor([skill("s1", 4)]), "s1");
        expect(s.openRoll).toBeUndefined();
        expect(s.rollState.targetNumber).toBeGreaterThan(0);
    });

    // The defender in a skill challenge is a different actor with different
    // skill item ids — only the base skill's own name survives across actors.
    it("carries the base skill's name in next.args, not the specialization-qualified title", () => {
        const s = buildSkillSetup(actor([skill("s1", 4, [{ name: "Pistols", value: 6 }], "agility", "Firearms")]), "s1", 0, "Firearms (Pistols)");
        const ctx = s.exportFn();
        expect(ctx.next.args.skillId).toBe("s1");
        expect(ctx.next.args.skillName).toBe("Firearms");
    });

    it("sets a skill defenseHint so a target selection triggers a contest", () => {
        const s = buildSkillSetup(actor([skill("s1", 4)]), "s1");
        expect(s.defenseHint).toEqual({ type: "skill", key: "s1", tnMod: 0, tnLabel: "Skill" });
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

    it("is a TN roll, not an open roll — required for challenge contests to count successes", () => {
        expect(buildAttributeSetup(actor([]), "strength").openRoll).toBeUndefined();
    });

    it("sets an attribute defenseHint so a target selection triggers a contest", () => {
        const s = buildAttributeSetup(actor([]), "strength");
        expect(s.defenseHint).toEqual({ type: "attribute", key: "strength", tnMod: 0, tnLabel: "strength" });
        expect(s.exportFn().next).toEqual({ kind: "attribute-response", ui: { label: "Respond" }, args: { attributeKey: "strength" } });
    });
});
