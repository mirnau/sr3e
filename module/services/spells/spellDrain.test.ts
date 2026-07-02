import { describe, expect, it, vi, afterEach } from "vitest";
import { buildSpellDrainSetup } from "./spellDrain";

function actor(overrides: Record<string, any> = {}) {
    return {
        id: "a1",
        name: "Mage",
        system: {
            attributes: {
                willpower: { value: 5, total: 5 },
                magic: { value: 6, total: 6 },
                isBurnedOut: false,
            },
            health: { stun: { value: 0 }, physical: { value: 0 } },
            ...overrides.system,
        },
        items: {
            contents: [
                { id: "sorcery", name: "Sorcery", type: "skill", system: { skillType: "active", activeSkill: { value: 4 } } },
            ],
        },
        update: vi.fn().mockResolvedValue(undefined),
        getFlag: vi.fn((_scope: string, key: string) => key === "sustainedSpells" ? (overrides.sustainedSpells ?? []) : undefined),
        ...overrides,
    };
}

function roll(results: number[]) {
    return { terms: [{ results: results.map(result => ({ result, active: true })) }], options: {}, meta: { flavor: "", procedureKind: "" } };
}

function mock2d6(total: number) {
    (globalThis as Record<string, unknown>).Roll = vi.fn().mockImplementation(class {
        total: number;
        terms = [];
        evaluate = vi.fn().mockResolvedValue(undefined);

        constructor() {
            this.total = total;
        }
    });
}

afterEach(() => {
    delete (globalThis as Record<string, unknown>).ChatMessage;
    delete (globalThis as Record<string, unknown>).Roll;
});

describe("buildSpellDrainSetup", () => {
    it("uses Willpower dice and half Force plus modifier TN", () => {
        const setup = buildSpellDrainSetup(actor(), { name: "Manabolt", force: 5, damageLevel: "s", drain: { powerModifier: 1 } });
        expect(setup.rollState.dice).toBe(5);
        expect(setup.rollState.targetNumber).toBe(3);
    });

    it("adds +2 Drain Power per spell already sustained by the caster", () => {
        const a = actor({
            sustainedSpells: [
                { id: "x1", spellId: "s0", spellName: "Armor", force: 3, sustainingFocusId: null },
            ],
        });
        const setup = buildSpellDrainSetup(a, { name: "Manabolt", force: 5, damageLevel: "s" });
        expect(setup.rollState.targetNumber).toBe(4);
    });

    it("caps Spell Pool by Sorcery value", () => {
        const setup = buildSpellDrainSetup(actor(), { name: "Manabolt", force: 5, damageLevel: "s" });
        expect(setup.rollState.modifiers[0].poolCap).toBe(4);
    });

    it("applies Stun drain when Force does not exceed Magic", async () => {
        const a = actor();
        const setup = buildSpellDrainSetup(a, { name: "Manabolt", force: 5, damageLevel: "s" });
        await setup.commitFn(roll([]), a);
        expect(a.update).toHaveBeenCalledWith({ "system.health.stun.value": 6 });
    });

    it("applies Physical drain when Force exceeds Magic", async () => {
        const a = actor({ system: { attributes: { willpower: { value: 5 }, magic: { value: 3 } }, health: { stun: { value: 0 }, physical: { value: 0 } } } });
        const setup = buildSpellDrainSetup(a, { name: "Manabolt", force: 5, damageLevel: "m" });
        await setup.commitFn(roll([]), a);
        expect(a.update).toHaveBeenCalledWith({ "system.health.physical.value": 3 });
    });

    it("takes no Drain when successes stage below Light", async () => {
        const a = actor();
        const setup = buildSpellDrainSetup(a, { name: "Manabolt", force: 5, damageLevel: "l" });
        await setup.commitFn(roll([5, 5]), a);
        expect(a.update).not.toHaveBeenCalled();
    });

    it("checks Magic loss after Deadly Physical Drain", async () => {
        mock2d6(5);
        const a = actor({ system: { attributes: { willpower: { value: 5 }, magic: { value: 6 } }, health: { stun: { value: 0 }, physical: { value: 0 } } } });
        const setup = buildSpellDrainSetup(a, { name: "Manabolt", force: 7, damageLevel: "d" });

        await setup.commitFn(roll([]), a);

        expect(a.update).toHaveBeenNthCalledWith(1, { "system.health.physical.value": 10 });
        expect(a.update).toHaveBeenNthCalledWith(2, {
            "system.attributes.magic.value": 5,
            "system.attributes.isBurnedOut": false,
        });
    });

    it("keeps Magic when Deadly Physical Drain check exceeds Magic", async () => {
        mock2d6(12);
        const a = actor({ system: { attributes: { willpower: { value: 5 }, magic: { value: 6 } }, health: { stun: { value: 0 }, physical: { value: 0 } } } });
        const setup = buildSpellDrainSetup(a, { name: "Manabolt", force: 7, damageLevel: "d" });

        await setup.commitFn(roll([]), a);

        expect(a.update).toHaveBeenCalledTimes(1);
        expect(a.update).toHaveBeenCalledWith({ "system.health.physical.value": 10 });
    });

    it("marks burnout when Magic loss reduces Magic to zero", async () => {
        mock2d6(1);
        const a = actor({ system: { attributes: { willpower: { value: 5 }, magic: { value: 1 } }, health: { stun: { value: 0 }, physical: { value: 0 } } } });
        const setup = buildSpellDrainSetup(a, { name: "Manabolt", force: 7, damageLevel: "d" });

        await setup.commitFn(roll([]), a);

        expect(a.update).toHaveBeenNthCalledWith(2, {
            "system.attributes.magic.value": 0,
            "system.attributes.isBurnedOut": true,
        });
    });
});
