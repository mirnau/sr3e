import { afterEach, describe, expect, it, vi } from "vitest";
import { deleteTransaction } from "./transactionDeletion";

function setGlobals(users: Array<{ id: string; isGM: boolean; active: boolean }>) {
    const create = vi.fn();
    (globalThis as Record<string, unknown>).game = {
        users,
        i18n: { format: (key: string, data: Record<string, unknown>) => `${key}:${JSON.stringify(data)}` },
    };
    (globalThis as Record<string, unknown>).CONFIG = { SR3E: { TRANSACTION: { deletedChat: "deletedChat" } } };
    (globalThis as Record<string, unknown>).ChatMessage = { create };
    return create;
}

describe("deleteTransaction", () => {
    afterEach(() => {
        delete (globalThis as Record<string, unknown>).game;
        delete (globalThis as Record<string, unknown>).CONFIG;
        delete (globalThis as Record<string, unknown>).ChatMessage;
    });

    it("whispers active GMs and deletes the transaction", async () => {
        const create = setGlobals([{ id: "gm1", isGM: true, active: true }, { id: "gm2", isGM: true, active: false }]);
        const deleteFn = vi.fn().mockResolvedValue(undefined);
        const transaction = { name: "Lifestyle", system: { amount: 1500 }, delete: deleteFn };
        const actor = { name: "Runner" } as Actor;

        await deleteTransaction(actor, transaction);

        expect(create).toHaveBeenCalledWith(expect.objectContaining({ whisper: ["gm1"] }));
        expect(deleteFn).toHaveBeenCalled();
    });

    it("still deletes when no GM is active, without posting a whisper", async () => {
        const create = setGlobals([{ id: "gm1", isGM: true, active: false }]);
        const deleteFn = vi.fn().mockResolvedValue(undefined);
        const transaction = { name: "Lifestyle", system: { amount: 1500 }, delete: deleteFn };
        const actor = { name: "Runner" } as Actor;

        await deleteTransaction(actor, transaction);

        expect(create).not.toHaveBeenCalled();
        expect(deleteFn).toHaveBeenCalled();
    });
});
