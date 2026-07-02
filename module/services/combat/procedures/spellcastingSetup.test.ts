import { describe, expect, it, vi } from "vitest";
import { buildSpellcastingSetup, canStartSpellcasting } from "./spellcastingSetup";

const sorcery = { id: "sorcery", name: "Sorcery", type: "skill", system: { skillType: "active", activeSkill: { value: 6 } } };

function spell(overrides: Record<string, any> = {}) {
    return {
        id: "spell1",
        name: "Manabolt",
        type: "spell",
        system: {
            type: "mana",
            category: "combat",
            learnedForce: 5,
            targeting: { kind: "attribute", attribute: "willpower", staticTargetNumber: 0 },
            resistance: { attribute: "willpower" },
            limits: { exclusive: false },
            ...overrides,
        },
        effects: { contents: [] },
    };
}

function focus(overrides: Record<string, any> = {}) {
    return {
        id: "focus1",
        name: "Power Focus",
        type: "focus",
        system: {
            focusType: "power",
            force: 3,
            bonded: true,
            active: true,
            dice: { spent: 1 },
            scope: {},
            ...overrides,
        },
        getFlag: (scope: string, key: string) => scope === "sr3e" && key === "isEquipped",
    };
}

function actor(items: any[], flags: any[] = [], createEmbeddedDocuments?: (type: string, data: unknown[]) => Promise<any[]>) {
    return {
        id: "actor1",
        items: {
            contents: items,
            get: (id: string) => items.find(item => item.id === id),
        },
        getFlag: (_scope: string, _key: string) => flags,
        setFlag: async (_scope: string, _key: string, value: unknown) => {
            flags = value as any[];
        },
        createEmbeddedDocuments,
    };
}

function rollWithResults(results: number[]) {
    return { terms: [{ results: results.map(result => ({ result, active: true })) }], options: {} };
}

describe("buildSpellcastingSetup", () => {
    it("uses Sorcery as base dice and Spell Pool as initial pool", () => {
        const setup = buildSpellcastingSetup(actor([sorcery]), spell());
        expect(setup.rollState.dice).toBe(6);
        expect(setup.initialPoolKey).toBe("spell");
    });

    it("adds a force control bounded by learned force", () => {
        const setup = buildSpellcastingSetup(actor([sorcery]), spell({ learnedForce: 5 }));
        expect(setup.forceControl).toEqual({ value: 5, min: 1, max: 5 });
        expect((setup.extraOptions?.spell as any).force).toBe(5);
    });

    it("adds a damage level control for combat spells", () => {
        const setup = buildSpellcastingSetup(actor([sorcery]), spell({ category: "combat", drain: { damageLevel: "s" } }));
        expect(setup.damageLevelControl?.value).toBe("s");
        expect((setup.extraOptions?.spell as any).damageLevel).toBe("s");
        expect(setup.exportFn().next.args.damageLevel).toBe("s");
    });

    it("clamps learned force control to at least 1", () => {
        const setup = buildSpellcastingSetup(actor([sorcery]), spell({ learnedForce: 0 }));
        expect((setup.extraOptions?.spell as any).force).toBe(1);
        expect((setup.extraOptions?.spell as any).learnedForce).toBe(1);
        expect(setup.forceControl).toEqual({ value: 1, min: 1, max: 1 });
    });

    it("uses static spell target number", () => {
        const setup = buildSpellcastingSetup(actor([sorcery]), spell({ targeting: { kind: "static", staticTargetNumber: 6 } }));
        expect(setup.rollState.targetNumber).toBe(6);
        expect((setup.extraOptions?.spell as any).targeting.kind).toBe("static");
    });

    it("marks attribute-target spells as resisted by the target attribute", () => {
        const setup = buildSpellcastingSetup(actor([sorcery]), spell({
            targeting: { kind: "attribute", attribute: "body", staticTargetNumber: 0 },
            resistance: { attribute: "willpower" },
        }));
        expect(setup.rollState.targetNumber).toBe(4);
        expect((setup.extraOptions?.spell as any).targeting.targetAttribute).toBe("body");
        expect((setup.extraOptions?.spell as any).targeting.resistanceAttribute).toBe("willpower");
        expect(setup.defenseHint).toEqual({ type: "attribute", key: "willpower", tnMod: 0, tnLabel: "Willpower" });
        expect(setup.exportFn().next.kind).toBe("spell-resistance");
        expect(setup.exportFn().next.args.force).toBe(5);
    });

    it("uses elemental manipulation target number", () => {
        const setup = buildSpellcastingSetup(actor([sorcery]), spell({
            category: "manipulation",
            manipulationSubtype: "elemental",
            elementalAttack: { targetNumber: 4, canDodge: true },
        }));
        expect(setup.rollState.targetNumber).toBe(4);
        expect((setup.extraOptions?.spell as any).targeting.kind).toBe("elemental");
    });

    it("lists eligible active focus dice as item-backed pool options", () => {
        const setup = buildSpellcastingSetup(actor([sorcery, focus()]), spell());
        expect(setup.poolOptions).toEqual([
            { key: "focus:focus1", itemId: "focus1", label: "Power Focus", available: 2, source: "item" },
        ]);
    });

    it("filters inactive foci from pool options", () => {
        const setup = buildSpellcastingSetup(actor([sorcery, focus({ active: false })]), spell());
        expect(setup.poolOptions).toEqual([]);
    });

    it("excludes a specific-spell focus bound to a different spell", () => {
        const specificFocus = focus({ focusType: "specificSpell", scope: { spellItemId: "otherSpell" } });
        const setup = buildSpellcastingSetup(actor([sorcery, specificFocus]), spell());
        expect(setup.poolOptions).toEqual([]);
    });

    it("includes a specific-spell focus bound to the spell being cast", () => {
        const specificFocus = focus({ focusType: "specificSpell", scope: { spellItemId: "spell1" } });
        const setup = buildSpellcastingSetup(actor([sorcery, specificFocus]), spell());
        expect(setup.poolOptions).toEqual([
            { key: "focus:focus1", itemId: "focus1", label: "Power Focus", available: 2, source: "item" },
        ]);
    });

    it("adds +2 target number per self-sustained spell", () => {
        const a = actor([sorcery], [
            { id: "x1", spellId: "s0", spellName: "Armor", force: 3, sustainingFocusId: null },
        ]);
        const setup = buildSpellcastingSetup(a, spell());
        expect(setup.rollState.modifiers).toContainEqual({ id: "sustaining-penalty", name: "Sustaining Spells", value: 2 });
    });

    it("tracks a newly cast sustained spell on commit", async () => {
        const a = actor([sorcery]);
        const setup = buildSpellcastingSetup(a, spell({ duration: { type: "sustained" } }));
        await setup.commitFn(undefined, a);
        expect((a.getFlag("sr3e", "sustainedSpells") as any[])).toEqual([
            expect.objectContaining({ spellId: "spell1", spellName: "Manabolt", force: 5, sustainingFocusId: null }),
        ]);
    });

    it("does not track an instant spell on commit", async () => {
        const a = actor([sorcery]);
        const setup = buildSpellcastingSetup(a, spell({ duration: { type: "instant" } }));
        await setup.commitFn(undefined, a);
        expect(a.getFlag("sr3e", "sustainedSpells")).toEqual([]);
    });

    it("auto-applies an attributeModPerTwo effect on the caster for a sustained spell", async () => {
        const createEmbeddedDocuments = vi.fn().mockResolvedValue([{ uuid: "Actor.a1.ActiveEffect.e1" }]);
        const a = actor([sorcery], [], createEmbeddedDocuments);
        const setup = buildSpellcastingSetup(a, spell({
            duration: { type: "sustained" },
            effect: { algorithm: "attributeModPerTwo", targetPath: "system.attributes.reaction.mod", scope: "caster" },
        }));

        await setup.commitFn(rollWithResults([5, 6, 6, 3]), a);

        expect(createEmbeddedDocuments).toHaveBeenCalledWith("ActiveEffect", [
            expect.objectContaining({
                changes: [{ key: "system.attributes.reaction.mod", type: "add", value: "1", priority: 0 }],
            }),
        ]);
        const sustained = a.getFlag("sr3e", "sustainedSpells") as any[];
        expect(sustained[0].appliedEffectUuid).toBe("Actor.a1.ActiveEffect.e1");
    });

    it("does not create an effect when the spell has no effect algorithm", async () => {
        const createEmbeddedDocuments = vi.fn();
        const a = actor([sorcery], [], createEmbeddedDocuments);
        const setup = buildSpellcastingSetup(a, spell({ duration: { type: "sustained" } }));

        await setup.commitFn(rollWithResults([5, 6, 6, 3]), a);

        expect(createEmbeddedDocuments).not.toHaveBeenCalled();
    });

    it("attaches a computed chat tag for a non-attributeModPerTwo algorithm without creating an ActiveEffect", async () => {
        const createEmbeddedDocuments = vi.fn();
        const a = actor([sorcery], [], createEmbeddedDocuments);
        const setup = buildSpellcastingSetup(a, spell({
            duration: { type: "sustained" },
            category: "illusion",
            effect: { algorithm: "tnPerSuccess" },
        }));

        await setup.commitFn(rollWithResults([5, 6, 6, 3]), a);

        expect((setup.extraOptions?.spell as any).effectTag).toBe("TN Modifier: 3");
        expect(createEmbeddedDocuments).not.toHaveBeenCalled();
    });

    it("attaches a chat tag for an instant (non-sustained) spell with an effect algorithm", async () => {
        const a = actor([sorcery]);
        const setup = buildSpellcastingSetup(a, spell({
            duration: { type: "instant" },
            category: "detection",
            learnedForce: 5,
            effect: { algorithm: "detectionRange" },
        }));

        await setup.commitFn(rollWithResults([]), a);

        expect((setup.extraOptions?.spell as any).effectTag).toBe("Detection Range (m): 0");
        expect(a.getFlag("sr3e", "sustainedSpells")).toEqual([]);
    });
});

describe("canStartSpellcasting", () => {
    it("allows spells with no attached fetish", () => {
        expect(canStartSpellcasting(spell())).toBe(true);
    });
});
