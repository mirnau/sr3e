import { describe, it, expect } from "vitest";
import { parseLinkedSkillId, resolveLinkedSkill, listDefaultingCandidates } from "./resolveLinkedSkill";

describe("parseLinkedSkillId", () => {
    it("empty string", () => expect(parseLinkedSkillId("")).toEqual({ skillId: "", specIndex: null }));
    it("skill only", () => expect(parseLinkedSkillId("abc123")).toEqual({ skillId: "abc123", specIndex: null }));
    it("skill + spec index 0", () => expect(parseLinkedSkillId("abc123::0")).toEqual({ skillId: "abc123", specIndex: 0 }));
    it("skill + spec index 2", () => expect(parseLinkedSkillId("abc123::2")).toEqual({ skillId: "abc123", specIndex: 2 }));
    it("malformed sep → no spec", () => expect(parseLinkedSkillId("abc::x")).toEqual({ skillId: "abc", specIndex: null }));
});

const skill = (id: string, value: number, specs: Array<{ value?: number; name?: string }> = [], attr = "agility", type = "active", name = id) => ({
    id, name, type: "skill",
    system: {
        skillType: type,
        activeSkill: { value, linkedAttribute: attr, specializations: specs },
    },
});

const actor = (items: ReturnType<typeof skill>[]) => ({
    items: {
        get: (id: string) => items.find(i => i.id === id),
        contents: items,
    },
});

describe("resolveLinkedSkill", () => {
    it("returns null for empty linkedSkillId", () => {
        expect(resolveLinkedSkill(actor([]), "")).toBeNull();
    });
    it("returns null when skill not found", () => {
        expect(resolveLinkedSkill(actor([]), "missing")).toBeNull();
    });
    it("base rating when no spec", () => {
        const a = actor([skill("s1", 4)]);
        const r = resolveLinkedSkill(a, "s1");
        expect(r?.dice).toBe(4);
        expect(r?.specIndex).toBeNull();
    });
    it("spec value when specIndex set and spec exists", () => {
        const a = actor([skill("s1", 4, [{ value: 6, name: "Pistols" }])]);
        const r = resolveLinkedSkill(a, "s1::0");
        expect(r?.dice).toBe(6);
        expect(r?.specName).toBe("Pistols");
    });
    it("falls back to base rating when spec has no own value", () => {
        const a = actor([skill("s1", 4, [{ name: "Pistols" }])]);
        const r = resolveLinkedSkill(a, "s1::0");
        expect(r?.dice).toBe(4);
    });
    it("exposes linkedAttribute", () => {
        const a = actor([skill("s1", 4, [], "quickness")]);
        expect(resolveLinkedSkill(a, "s1")?.linkedAttribute).toBe("quickness");
    });
});

describe("listDefaultingCandidates", () => {
    it("lists skills sharing the same linkedAttribute, including specializations", () => {
        const a = actor([
            skill("s1", 0, [], "agility", "active", "Assault Rifles"), // the skill being defaulted from — excluded
            skill("s2", 4, [{ value: 6, name: "Heavy Pistols" }], "agility", "active", "Guns"),
            skill("s3", 3, [], "quickness", "active", "Dodge"), // different attribute — excluded
        ]);
        const candidates = listDefaultingCandidates(a, "agility", "s1");

        expect(candidates).toEqual([
            { linkedSkillId: "s2", label: "Guns", rating: 4 },
            { linkedSkillId: "s2::0", label: "Guns — Heavy Pistols", rating: 6 },
        ]);
    });

    it("excludes the skill being defaulted from even if it shares its own linkedAttribute", () => {
        const a = actor([skill("s1", 0, [], "agility", "active", "Assault Rifles")]);
        expect(listDefaultingCandidates(a, "agility", "s1")).toEqual([]);
    });

    it("returns an empty list when no skills share the attribute", () => {
        const a = actor([skill("s1", 4, [], "quickness")]);
        expect(listDefaultingCandidates(a, "agility", null)).toEqual([]);
    });

    it("specialization without its own rating falls back to the base skill's", () => {
        const a = actor([skill("s2", 4, [{ name: "Heavy Pistols" }], "agility", "active", "Guns")]);
        const candidates = listDefaultingCandidates(a, "agility", null);
        expect(candidates.find(c => c.linkedSkillId === "s2::0")?.rating).toBe(4);
    });
});
