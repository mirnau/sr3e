import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { registerAugmentationEssenceHook } from "./augmentationEssence";
import { hooks, typekeys } from "../../types/configuration-keys";

let nextId = 0;

function makeItem(overrides: Partial<{ effects: unknown[]; essenceCost: number; embedded: boolean; type: string }> = {}) {
    const id = `item${++nextId}`;
    const embedded = overrides.embedded ?? true;
    return {
        id,
        uuid: `Actor.actor1.Item.${id}`,
        type: overrides.type ?? typekeys.augmentation,
        img: "icons/svg/mystery-man.svg",
        parent: embedded ? new (globalThis as any).Actor() : null,
        system: { essenceCost: overrides.essenceCost ?? 1 },
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
    (globalThis as Record<string, unknown>).CONFIG = { SR3E: { AUGMENTATION: { augmentation: "sr3e.augmentation.augmentation" } } };
    (globalThis as Record<string, unknown>).foundry = { utils: { randomID: () => "generated-id" } };
    (globalThis as Record<string, unknown>).Actor = class {};
});

afterEach(() => {
    delete (globalThis as Record<string, unknown>).Hooks;
    delete (globalThis as Record<string, unknown>).game;
    delete (globalThis as Record<string, unknown>).localize;
    delete (globalThis as Record<string, unknown>).CONFIG;
    delete (globalThis as Record<string, unknown>).foundry;
    delete (globalThis as Record<string, unknown>).Actor;
});

describe("registerAugmentationEssenceHook", () => {
    it("registers on createItem", () => {
        registerAugmentationEssenceHook();
        expect((Hooks.on as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith(hooks.createItem, expect.any(Function));
    });

    it("applies a negative essence.mod ActiveEffect to an augmentation embedded on a character", async () => {
        registerAugmentationEssenceHook();
        const item = makeItem({ essenceCost: 1.5 });

        await capturedHandler(item, { temporary: false }, "u1");

        expect(item.createEmbeddedDocuments).toHaveBeenCalledTimes(1);
        const call = item.createEmbeddedDocuments.mock.calls[0]!;
        const effectData = (call[1] as Record<string, unknown>[])[0] as { changes: Record<string, unknown>[]; flags: { sr3e: Record<string, unknown> } };
        expect(effectData.changes).toEqual([
            expect.objectContaining({ key: "system.attributes.essence.mod", type: "add", value: "-1.5" }),
        ]);
        expect(effectData.flags.sr3e.augmentationEssence).toBe(true);
    });

    it("ignores items of other types", async () => {
        registerAugmentationEssenceHook();
        const item = makeItem({ type: "weapon" });

        await capturedHandler(item, { temporary: false }, "u1");

        expect(item.createEmbeddedDocuments).not.toHaveBeenCalled();
    });
});
