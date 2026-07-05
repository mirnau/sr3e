import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { registerItemEssenceEffectHook } from "./itemEssenceEffect";
import { hooks } from "../../types/configuration-keys";

const ITEM_TYPE = "widget";
const FLAG_KEY = "widgetEssence";
const LABEL_TOKEN = "sr3e.widget.widget";
const FALLBACK_IMG = "icons/svg/widget.svg";

let nextId = 0;

function makeItem(overrides: Partial<{ effects: unknown[]; essenceCost: number; embedded: boolean; type: string }> = {}) {
    const id = `item${++nextId}`;
    const embedded = overrides.embedded ?? true;
    return {
        id,
        uuid: `Actor.actor1.Item.${id}`,
        type: overrides.type ?? ITEM_TYPE,
        img: "icons/svg/mystery-man.svg",
        parent: embedded ? new (globalThis as any).Actor() : null,
        system: { essenceCost: overrides.essenceCost ?? 2 },
        effects: { contents: overrides.effects ?? [] },
        createEmbeddedDocuments: vi.fn().mockResolvedValue(undefined),
    };
}

let capturedHandler: (document: unknown, options: unknown, userId: string) => Promise<void>;

beforeEach(() => {
    (globalThis as Record<string, unknown>).Hooks = {
        on: vi.fn((_event: string, handler: typeof capturedHandler) => { capturedHandler = handler; }),
    };
    (globalThis as Record<string, unknown>).game = { user: { id: "u1" } };
    (globalThis as Record<string, unknown>).localize = (key: string) => key;
    (globalThis as Record<string, unknown>).foundry = { utils: { randomID: () => "generated-id" } };
    (globalThis as Record<string, unknown>).Actor = class {};
});

afterEach(() => {
    delete (globalThis as Record<string, unknown>).Hooks;
    delete (globalThis as Record<string, unknown>).game;
    delete (globalThis as Record<string, unknown>).localize;
    delete (globalThis as Record<string, unknown>).foundry;
    delete (globalThis as Record<string, unknown>).Actor;
});

describe("registerItemEssenceEffectHook", () => {
    it("registers on createItem", () => {
        registerItemEssenceEffectHook(ITEM_TYPE, FLAG_KEY, LABEL_TOKEN, FALLBACK_IMG);
        expect((Hooks.on as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith(hooks.createItem, expect.any(Function));
    });

    it("creates one string-typed essence change on a confirmed, initiating-client creation", async () => {
        registerItemEssenceEffectHook(ITEM_TYPE, FLAG_KEY, LABEL_TOKEN, FALLBACK_IMG);
        const item = makeItem({ essenceCost: 2.5 });

        await capturedHandler(item, { temporary: false }, "u1");

        expect(item.createEmbeddedDocuments).toHaveBeenCalledTimes(1);
        const call = item.createEmbeddedDocuments.mock.calls[0]!;
        const effectData = (call[1] as Record<string, unknown>[])[0] as { _id: string; changes: Record<string, unknown>[]; flags: { sr3e: { target: string } } };
        expect(effectData.changes).toEqual([
            expect.objectContaining({ key: "system.attributes.essence.mod", type: "add", value: "-2.5" }),
        ]);
        expect(effectData.flags.sr3e.target).toBe("character");
        expect(effectData.changes[0]?.mode).toBeUndefined();
        expect(effectData._id).toBeTruthy();
    });

    it("skips a bare item with no parent actor (still sitting in the sidebar)", async () => {
        registerItemEssenceEffectHook(ITEM_TYPE, FLAG_KEY, LABEL_TOKEN, FALLBACK_IMG);
        const item = makeItem({ embedded: false });

        await capturedHandler(item, { temporary: false }, "u1");

        expect(item.createEmbeddedDocuments).not.toHaveBeenCalled();
    });

    it("skips a temporary (predicted) document", async () => {
        registerItemEssenceEffectHook(ITEM_TYPE, FLAG_KEY, LABEL_TOKEN, FALLBACK_IMG);
        const item = makeItem();

        await capturedHandler(item, { temporary: true }, "u1");

        expect(item.createEmbeddedDocuments).not.toHaveBeenCalled();
    });

    it("skips when firing for a different client than the initiator", async () => {
        registerItemEssenceEffectHook(ITEM_TYPE, FLAG_KEY, LABEL_TOKEN, FALLBACK_IMG);
        const item = makeItem();

        await capturedHandler(item, { temporary: false }, "someone-else");

        expect(item.createEmbeddedDocuments).not.toHaveBeenCalled();
    });

    it("does not add a second effect when one already carries the essence flag", async () => {
        registerItemEssenceEffectHook(ITEM_TYPE, FLAG_KEY, LABEL_TOKEN, FALLBACK_IMG);
        const item = makeItem({ effects: [{ flags: { sr3e: { [FLAG_KEY]: true } } }] });

        await capturedHandler(item, { temporary: false }, "u1");

        expect(item.createEmbeddedDocuments).not.toHaveBeenCalled();
    });

    it("does not double-fire for the same item within an overlapping async window", async () => {
        registerItemEssenceEffectHook(ITEM_TYPE, FLAG_KEY, LABEL_TOKEN, FALLBACK_IMG);
        const item = makeItem();

        await Promise.all([
            capturedHandler(item, { temporary: false }, "u1"),
            capturedHandler(item, { temporary: false }, "u1"),
        ]);

        expect(item.createEmbeddedDocuments).toHaveBeenCalledTimes(1);
    });

    it("ignores items of other types", async () => {
        registerItemEssenceEffectHook(ITEM_TYPE, FLAG_KEY, LABEL_TOKEN, FALLBACK_IMG);
        const item = makeItem({ type: "something-else" });

        await capturedHandler(item, { temporary: false }, "u1");

        expect(item.createEmbeddedDocuments).not.toHaveBeenCalled();
    });
});
