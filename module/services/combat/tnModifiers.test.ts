import { describe, it, expect } from "vitest";
import { tnModifiers } from "./tnModifiers";

const magicItem = (archetype: string) => ({ type: "magic", system: { awakened: { archetype } } });
const powerItem = (name: string, mods: { targetKind: string; targetId: string; modifier: number }[]) => ({
    type: "adeptpower", name, system: { tnModifiers: mods },
});
const augmentationItem = (name: string, mods: { targetKind: string; targetId: string; modifier: number }[]) => ({
    type: "augmentation", name, system: { tnModifiers: mods },
});

describe("tnModifiers — adept powers", () => {
    it("returns nothing for a non-adept character", () => {
        const actor = { items: [magicItem("magician"), powerItem("Foo", [{ targetKind: "skill", targetId: "s1", modifier: 2 }])] };
        expect(tnModifiers(actor, "skill", "s1")).toEqual([]);
    });

    it("matches a skill-targeted modifier for an adept", () => {
        const actor = { items: [magicItem("adept"), powerItem("Killing Hands", [{ targetKind: "skill", targetId: "s1", modifier: -2 }])] };
        const mods = tnModifiers(actor, "skill", "s1");
        expect(mods).toEqual([expect.objectContaining({ name: "Killing Hands", value: -2 })]);
    });

    it("matches an attribute-targeted modifier for an adept", () => {
        const actor = { items: [magicItem("adept"), powerItem("Attribute Boost", [{ targetKind: "attribute", targetId: "strength", modifier: -1 }])] };
        const mods = tnModifiers(actor, "attribute", "strength");
        expect(mods).toEqual([expect.objectContaining({ name: "Attribute Boost", value: -1 })]);
    });
});

describe("tnModifiers — augmentations", () => {
    it("matches an augmentation's TN modifier with no adept/magic item required", () => {
        const actor = { items: [augmentationItem("Cybereyes", [{ targetKind: "skill", targetId: "s1", modifier: -1 }])] };
        const mods = tnModifiers(actor, "skill", "s1");
        expect(mods).toEqual([expect.objectContaining({ name: "Cybereyes", value: -1 })]);
    });

    it("applies for a magician too (no archetype gate on augmentations)", () => {
        const actor = { items: [magicItem("magician"), augmentationItem("Wired Reflexes", [{ targetKind: "attribute", targetId: "reaction", modifier: -2 }])] };
        const mods = tnModifiers(actor, "attribute", "reaction");
        expect(mods).toEqual([expect.objectContaining({ name: "Wired Reflexes", value: -2 })]);
    });

    it("combines both adept-power and augmentation modifiers for the same target", () => {
        const actor = {
            items: [
                magicItem("adept"),
                powerItem("Killing Hands", [{ targetKind: "skill", targetId: "s1", modifier: -2 }]),
                augmentationItem("Cybereyes", [{ targetKind: "skill", targetId: "s1", modifier: -1 }]),
            ],
        };
        const mods = tnModifiers(actor, "skill", "s1");
        expect(mods).toHaveLength(2);
    });
});

describe("tnModifiers — misc", () => {
    it("ignores entries for a different target", () => {
        const actor = { items: [augmentationItem("Foo", [{ targetKind: "skill", targetId: "s1", modifier: 2 }])] };
        expect(tnModifiers(actor, "skill", "s2")).toEqual([]);
    });

    it("works with an items collection shaped as { contents }", () => {
        const actor = { items: { contents: [augmentationItem("Foo", [{ targetKind: "skill", targetId: "s1", modifier: 3 }])] } };
        expect(tnModifiers(actor, "skill", "s1")).toEqual([expect.objectContaining({ value: 3 })]);
    });
});
