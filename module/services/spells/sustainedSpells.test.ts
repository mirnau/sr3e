import { afterEach, describe, expect, it, vi } from "vitest";
import {
    addSustainedSpell,
    attachSustainedEffect,
    canSustainInFocus,
    dropSustainedSpell,
    listSustainedSpells,
    registerSustainedSpellCleanupHook,
    sustainSpellInFocus,
    sustainingDrainPower,
    sustainingTnPenalty,
} from "./sustainedSpells";

function actor(initial: any[] = []) {
    let flags = initial;
    return {
        getFlag: vi.fn((_scope: string, _key: string) => flags),
        setFlag: vi.fn(async (_scope: string, _key: string, value: unknown) => {
            flags = value as any[];
        }),
    };
}

describe("sustained spell tracking", () => {
    it("lists no sustained spells by default", () => {
        expect(listSustainedSpells(actor())).toEqual([]);
    });

    it("adds a sustained spell and assigns an id", async () => {
        const a = actor();
        const entry = await addSustainedSpell(a, { spellId: "s1", spellName: "Armor", force: 4, sustainingFocusId: null });
        expect(entry.id).toBeTruthy();
        expect(listSustainedSpells(a)).toEqual([entry]);
    });

    it("drops a sustained spell by id", async () => {
        const a = actor();
        const entry = await addSustainedSpell(a, { spellId: "s1", spellName: "Armor", force: 4, sustainingFocusId: null });
        await dropSustainedSpell(a, entry.id);
        expect(listSustainedSpells(a)).toEqual([]);
    });

    it("adds +2 TN penalty per self-sustained spell", async () => {
        const a = actor();
        await addSustainedSpell(a, { spellId: "s1", spellName: "Armor", force: 4, sustainingFocusId: null });
        await addSustainedSpell(a, { spellId: "s2", spellName: "Shield", force: 3, sustainingFocusId: null });
        expect(sustainingTnPenalty(a)).toBe(4);
        expect(sustainingDrainPower(a)).toBe(4);
    });

    it("excludes focus-custodied spells from the caster's sustaining penalty", async () => {
        const a = actor();
        await addSustainedSpell(a, { spellId: "s1", spellName: "Armor", force: 4, sustainingFocusId: "focus1" });
        expect(sustainingTnPenalty(a)).toBe(0);
        expect(sustainingDrainPower(a)).toBe(0);
    });

    it("allows sustaining into a focus with sufficient Force", () => {
        expect(canSustainInFocus({ system: { force: 5 } }, 4)).toBe(true);
        expect(canSustainInFocus({ system: { force: 3 } }, 4)).toBe(false);
    });

    it("sustains a spell into a focus and marks it focus-custodied", async () => {
        const a = actor();
        const entry = await sustainSpellInFocus(a, { id: "focus1", system: { force: 5 } }, { id: "s1", name: "Armor" }, 4);
        expect(entry?.sustainingFocusId).toBe("focus1");
        expect(sustainingTnPenalty(a)).toBe(0);
    });

    it("refuses to sustain into a focus with insufficient Force", async () => {
        const a = actor();
        const entry = await sustainSpellInFocus(a, { id: "focus1", system: { force: 2 } }, { id: "s1", name: "Armor" }, 4);
        expect(entry).toBeNull();
        expect(listSustainedSpells(a)).toEqual([]);
    });
});

describe("sustained spell effect attachment", () => {
    afterEach(() => {
        delete (globalThis as Record<string, unknown>).fromUuid;
    });

    it("creates a tagged ActiveEffect on the target actor and records its uuid", async () => {
        const a = actor();
        const entry = await addSustainedSpell(a, { spellId: "s1", spellName: "Increase Reflexes", force: 4, sustainingFocusId: null });
        const createEmbeddedDocuments = vi.fn().mockResolvedValue([{ uuid: "Actor.x.ActiveEffect.y" }]);

        await attachSustainedEffect(a, { createEmbeddedDocuments }, entry.id, "system.attributes.reaction.mod", 2, "Increase Reflexes (Sustained)");

        expect(createEmbeddedDocuments).toHaveBeenCalledWith("ActiveEffect", [
            expect.objectContaining({
                changes: [{ key: "system.attributes.reaction.mod", type: "add", value: "2", priority: 0 }],
                flags: { sr3e: { sustainedSpellId: entry.id } },
            }),
        ]);
        expect(listSustainedSpells(a)[0].appliedEffectUuid).toBe("Actor.x.ActiveEffect.y");
    });

    it("deletes the tagged ActiveEffect when the sustained spell is dropped", async () => {
        const a = actor();
        const entry = await addSustainedSpell(a, { spellId: "s1", spellName: "Increase Reflexes", force: 4, sustainingFocusId: null });
        const createEmbeddedDocuments = vi.fn().mockResolvedValue([{ uuid: "Actor.x.ActiveEffect.y" }]);
        await attachSustainedEffect(a, { createEmbeddedDocuments }, entry.id, "system.attributes.reaction.mod", 2, "Increase Reflexes (Sustained)");

        const deleteFn = vi.fn().mockResolvedValue(undefined);
        (globalThis as Record<string, unknown>).fromUuid = vi.fn().mockResolvedValue({ delete: deleteFn });

        await dropSustainedSpell(a, entry.id);

        expect(deleteFn).toHaveBeenCalled();
        expect(listSustainedSpells(a)).toEqual([]);
    });
});

describe("sustained spell cleanup on native ActiveEffect deletion", () => {
    afterEach(() => {
        delete (globalThis as Record<string, unknown>).Hooks;
        delete (globalThis as Record<string, unknown>).game;
    });

    it("removes the flag entry when its tagged ActiveEffect is deleted outside dropSustainedSpell", async () => {
        const a = actor();
        const entry = await addSustainedSpell(a, { spellId: "s1", spellName: "Armor", force: 4, sustainingFocusId: null });

        let deleteHandler: ((effect: unknown) => Promise<void>) | undefined;
        (globalThis as Record<string, unknown>).Hooks = {
            on: vi.fn((event: string, handler: (effect: unknown) => Promise<void>) => {
                if (event === "deleteActiveEffect") deleteHandler = handler;
            }),
        };
        (globalThis as Record<string, unknown>).game = { actors: [a] };

        registerSustainedSpellCleanupHook();
        await deleteHandler?.({ flags: { sr3e: { sustainedSpellId: entry.id } } });

        expect(listSustainedSpells(a)).toEqual([]);
    });

    it("ignores ActiveEffect deletions unrelated to sustained spells", async () => {
        const a = actor();
        const entry = await addSustainedSpell(a, { spellId: "s1", spellName: "Armor", force: 4, sustainingFocusId: null });

        let deleteHandler: ((effect: unknown) => Promise<void>) | undefined;
        (globalThis as Record<string, unknown>).Hooks = {
            on: vi.fn((event: string, handler: (effect: unknown) => Promise<void>) => {
                if (event === "deleteActiveEffect") deleteHandler = handler;
            }),
        };
        (globalThis as Record<string, unknown>).game = { actors: [a] };

        registerSustainedSpellCleanupHook();
        await deleteHandler?.({ flags: {} });

        expect(listSustainedSpells(a)).toEqual([entry]);
    });
});
