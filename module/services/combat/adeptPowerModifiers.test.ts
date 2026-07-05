import { describe, it, expect } from "vitest";
import { adeptPowerTnModifiers } from "./adeptPowerModifiers";

const magicItem = (archetype: string) => ({ type: "magic", system: { awakened: { archetype } } });
const powerItem = (name: string, tnModifiers: { targetKind: string; targetId: string; modifier: number }[]) => ({
    type: "adeptpower", name, system: { tnModifiers },
});

describe("adeptPowerTnModifiers", () => {
    it("returns nothing for a non-adept character", () => {
        const actor = { items: [magicItem("magician"), powerItem("Foo", [{ targetKind: "skill", targetId: "s1", modifier: 2 }])] };
        expect(adeptPowerTnModifiers(actor, "skill", "s1")).toEqual([]);
    });

    it("returns nothing for a character with no Magic item at all", () => {
        const actor = { items: [powerItem("Foo", [{ targetKind: "skill", targetId: "s1", modifier: 2 }])] };
        expect(adeptPowerTnModifiers(actor, "skill", "s1")).toEqual([]);
    });

    it("matches a skill-targeted modifier for an adept", () => {
        const actor = { items: [magicItem("adept"), powerItem("Killing Hands", [{ targetKind: "skill", targetId: "s1", modifier: -2 }])] };
        const mods = adeptPowerTnModifiers(actor, "skill", "s1");
        expect(mods).toEqual([expect.objectContaining({ name: "Killing Hands", value: -2 })]);
    });

    it("matches an attribute-targeted modifier for an adept", () => {
        const actor = { items: [magicItem("adept"), powerItem("Attribute Boost", [{ targetKind: "attribute", targetId: "strength", modifier: -1 }])] };
        const mods = adeptPowerTnModifiers(actor, "attribute", "strength");
        expect(mods).toEqual([expect.objectContaining({ name: "Attribute Boost", value: -1 })]);
    });

    it("ignores entries for a different target", () => {
        const actor = { items: [magicItem("adept"), powerItem("Foo", [{ targetKind: "skill", targetId: "s1", modifier: 2 }])] };
        expect(adeptPowerTnModifiers(actor, "skill", "s2")).toEqual([]);
    });

    it("ignores non-adeptpower items", () => {
        const actor = { items: [magicItem("adept"), { type: "weapon", system: {} }] };
        expect(adeptPowerTnModifiers(actor, "skill", "s1")).toEqual([]);
    });

    it("works with an items collection shaped as { contents }", () => {
        const actor = { items: { contents: [magicItem("adept"), powerItem("Foo", [{ targetKind: "skill", targetId: "s1", modifier: 3 }])] } };
        expect(adeptPowerTnModifiers(actor, "skill", "s1")).toEqual([expect.objectContaining({ value: 3 })]);
    });
});
