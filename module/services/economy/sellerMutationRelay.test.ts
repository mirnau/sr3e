import { describe, expect, it, vi, afterEach } from "vitest";
import { registerSellerMutationRelay, requestSellerCreate, requestSellerDelete } from "./sellerMutationRelay";

afterEach(() => { delete (globalThis as Record<string, unknown>).game; });

function seller(id = "seller1", itemIds: string[] = ["item1"]) {
    return {
        id,
        items: { get: (itemId: string) => (itemIds.includes(itemId) ? { id: itemId } : undefined) },
        createEmbeddedDocuments: vi.fn().mockResolvedValue([{}]),
        deleteEmbeddedDocuments: vi.fn().mockResolvedValue([{}]),
    };
}

describe("requestSellerDelete", () => {
    it("deletes directly when the current user is GM", async () => {
        const s = seller();
        (globalThis as Record<string, unknown>).game = {
            user: { isGM: true },
            actors: { get: (id: string) => (id === s.id ? s : undefined) },
        };

        await requestSellerDelete("seller1", "item1");

        expect(s.deleteEmbeddedDocuments).toHaveBeenCalledWith("Item", ["item1"]);
    });

    it("relays via socket when the current user is not GM", async () => {
        const emit = vi.fn();
        (globalThis as Record<string, unknown>).game = { user: { isGM: false }, socket: { emit } };

        await requestSellerDelete("seller1", "item1");

        expect(emit).toHaveBeenCalledWith("system.sr3e", { type: "purchaseSellerDelete", sellerActorId: "seller1", itemId: "item1" });
    });

    it("is a no-op, not an error, when the item was already deleted (e.g. two GM sessions both received the request)", async () => {
        const s = seller("seller1", []);
        (globalThis as Record<string, unknown>).game = {
            user: { isGM: true },
            actors: { get: (id: string) => (id === s.id ? s : undefined) },
        };

        await expect(requestSellerDelete("seller1", "item1")).resolves.toBeUndefined();
        expect(s.deleteEmbeddedDocuments).not.toHaveBeenCalled();
    });
});

describe("requestSellerCreate", () => {
    it("creates directly when the current user is GM", async () => {
        const s = seller();
        (globalThis as Record<string, unknown>).game = {
            user: { isGM: true },
            actors: { get: (id: string) => (id === s.id ? s : undefined) },
        };

        await requestSellerCreate("seller1", { name: "Proceeds" });

        expect(s.createEmbeddedDocuments).toHaveBeenCalledWith("Item", [{ name: "Proceeds" }]);
    });

    it("relays via socket when the current user is not GM", async () => {
        const emit = vi.fn();
        (globalThis as Record<string, unknown>).game = { user: { isGM: false }, socket: { emit } };

        await requestSellerCreate("seller1", { name: "Proceeds" });

        expect(emit).toHaveBeenCalledWith("system.sr3e", { type: "purchaseSellerCreate", sellerActorId: "seller1", data: { name: "Proceeds" } });
    });
});

describe("registerSellerMutationRelay", () => {
    it("performs the mutation on the GM's client when a delete payload arrives", () => {
        const s = seller();
        let handler: ((payload: unknown) => void) | undefined;
        (globalThis as Record<string, unknown>).game = {
            user: { isGM: true },
            actors: { get: (id: string) => (id === s.id ? s : undefined) },
            socket: { on: (_event: string, cb: (payload: unknown) => void) => { handler = cb; } },
        };

        registerSellerMutationRelay();
        handler?.({ type: "purchaseSellerDelete", sellerActorId: "seller1", itemId: "item1" });

        expect(s.deleteEmbeddedDocuments).toHaveBeenCalledWith("Item", ["item1"]);
    });

    it("ignores the payload on a non-GM client", () => {
        const s = seller();
        let handler: ((payload: unknown) => void) | undefined;
        (globalThis as Record<string, unknown>).game = {
            user: { isGM: false },
            actors: { get: (id: string) => (id === s.id ? s : undefined) },
            socket: { on: (_event: string, cb: (payload: unknown) => void) => { handler = cb; } },
        };

        registerSellerMutationRelay();
        handler?.({ type: "purchaseSellerDelete", sellerActorId: "seller1", itemId: "item1" });

        expect(s.deleteEmbeddedDocuments).not.toHaveBeenCalled();
    });
});
