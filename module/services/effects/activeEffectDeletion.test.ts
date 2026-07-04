import { afterEach, describe, expect, it, vi } from "vitest";
import { deleteActiveEffect } from "./activeEffectDeletion";

function setGlobals(users: Array<{ id: string; isGM: boolean; active: boolean }>) {
    const create = vi.fn();
    (globalThis as Record<string, unknown>).game = {
        user: { name: "Player" },
        users,
        i18n: { format: (key: string, data: Record<string, unknown>) => `${key}:${JSON.stringify(data)}` },
    };
    (globalThis as Record<string, unknown>).CONFIG = { SR3E: { EFFECTS: { deletedChat: "deletedChat" } } };
    (globalThis as Record<string, unknown>).ChatMessage = { create };
    return create;
}

describe("deleteActiveEffect", () => {
    afterEach(() => {
        delete (globalThis as Record<string, unknown>).game;
        delete (globalThis as Record<string, unknown>).CONFIG;
        delete (globalThis as Record<string, unknown>).ChatMessage;
    });

    it("deletes the effect and whispers active GMs", async () => {
        const create = setGlobals([{ id: "gm1", isGM: true, active: true }, { id: "gm2", isGM: true, active: false }]);
        const deleteEmbeddedDocuments = vi.fn().mockResolvedValue(undefined);
        const actor = { name: "Runner", deleteEmbeddedDocuments } as unknown as Actor;
        const effect = { id: "effect1", name: "Wired" } as unknown as ActiveEffect;

        await deleteActiveEffect(actor, effect);

        expect(deleteEmbeddedDocuments).toHaveBeenCalledWith("ActiveEffect", ["effect1"], { render: false });
        expect(create).toHaveBeenCalledWith(expect.objectContaining({ whisper: ["gm1"] }));
        expect(String(create.mock.calls[0]?.[0]?.content)).toContain("\"effectName\":\"Wired\"");
    });

    it("does not whisper when deletion fails", async () => {
        const create = setGlobals([{ id: "gm1", isGM: true, active: true }]);
        const deleteEmbeddedDocuments = vi.fn().mockRejectedValue(new Error("delete failed"));
        const actor = { name: "Runner", deleteEmbeddedDocuments } as unknown as Actor;
        const effect = { id: "effect1", name: "Wired" } as unknown as ActiveEffect;

        await expect(deleteActiveEffect(actor, effect)).rejects.toThrow("delete failed");

        expect(create).not.toHaveBeenCalled();
    });
});
