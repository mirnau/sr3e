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

function mockChatMessage() {
    const create = vi.fn().mockResolvedValue(undefined);
    (globalThis as Record<string, unknown>).ChatMessage = { create };
    return create;
}

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

    // Health is deliberately NOT applied at roll time — only once the player
    // commits via the Done button on the interactive message (see
    // drainRerollHandler.test.ts). Applying a "worst case" here and
    // reimbursing on every reroll/buy was the source of a lost-update bug.
    it("does not touch actor health at roll time — only posts the interactive message", async () => {
        const a = actor();
        const setup = buildSpellDrainSetup(a, { name: "Manabolt", force: 5, damageLevel: "s" });
        await setup.commitFn(roll([]), a);
        expect(a.update).not.toHaveBeenCalled();
    });

    it("checks Magic loss after Deadly Physical Drain even before Done is clicked", async () => {
        mock2d6(5);
        const a = actor({ system: { attributes: { willpower: { value: 5 }, magic: { value: 6 } }, health: { stun: { value: 0 }, physical: { value: 0 } } } });
        const setup = buildSpellDrainSetup(a, { name: "Manabolt", force: 7, damageLevel: "d" });

        await setup.commitFn(roll([]), a);

        expect(a.update).toHaveBeenCalledWith({
            "system.attributes.magic.value": 5,
            "system.attributes.isBurnedOut": false,
        });
    });

    it("keeps Magic when Deadly Physical Drain check exceeds Magic", async () => {
        mock2d6(12);
        const a = actor({ system: { attributes: { willpower: { value: 5 }, magic: { value: 6 } }, health: { stun: { value: 0 }, physical: { value: 0 } } } });
        const setup = buildSpellDrainSetup(a, { name: "Manabolt", force: 7, damageLevel: "d" });

        await setup.commitFn(roll([]), a);

        expect(a.update).not.toHaveBeenCalled();
    });

    it("states the exact box count and track that will be applied in the outcome message", async () => {
        const create = mockChatMessage();
        const a = actor();
        const setup = buildSpellDrainSetup(a, { name: "Manabolt", force: 5, damageLevel: "s" });

        await setup.commitFn(roll([]), a);

        expect(create).toHaveBeenCalledWith(expect.objectContaining({
            content: expect.stringContaining("6 boxes of stun damage"),
        }));
    });

    it("states success with no damage when drain is fully resisted", async () => {
        const create = mockChatMessage();
        const a = actor();
        const setup = buildSpellDrainSetup(a, { name: "Manabolt", force: 5, damageLevel: "l" });

        await setup.commitFn(roll([5, 5]), a);

        expect(create).toHaveBeenCalledWith(expect.objectContaining({
            content: expect.stringContaining("Your drain roll succeeded"),
        }));
    });

    it("attaches an interactive drainOutcome flag with the roll's dice results", async () => {
        const create = mockChatMessage();
        const a = actor();
        const setup = buildSpellDrainSetup(a, { name: "Manabolt", force: 5, damageLevel: "s" });

        await setup.commitFn(roll([3, 6]), a);

        expect(create).toHaveBeenCalledWith(expect.objectContaining({
            flags: { sr3e: { drainOutcome: expect.objectContaining({
                actorId: "a1",
                track: "stun",
                results: [{ result: 3 }, { result: 6 }],
                rerollCount: 0,
            }) } },
        }));
    });

    it("marks burnout when Magic loss reduces Magic to zero", async () => {
        mock2d6(1);
        const a = actor({ system: { attributes: { willpower: { value: 5 }, magic: { value: 1 } }, health: { stun: { value: 0 }, physical: { value: 0 } } } });
        const setup = buildSpellDrainSetup(a, { name: "Manabolt", force: 7, damageLevel: "d" });

        await setup.commitFn(roll([]), a);

        expect(a.update).toHaveBeenCalledWith({
            "system.attributes.magic.value": 0,
            "system.attributes.isBurnedOut": true,
        });
    });
});
