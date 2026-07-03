import { describe, expect, it, vi, afterEach } from "vitest";
import { initiatePurchase, handleSellerConsentResponse, handlePurchaseOfferResponse } from "./purchaseOfferFlow";

const renderCtor = vi.fn();
vi.mock("../../sheets/actors/PurchaseDialogApp", () => ({
    PurchaseDialogApp: class {
        constructor(...args: unknown[]) {
            renderCtor(...args);
        }
        render() {}
    },
}));

type Options = {
    userId: string;
    isGM: boolean;
    users: Array<{ id: string; isGM: boolean; active: boolean }>;
    actors: Record<string, any>;
};

function setGame({ userId, isGM, users, actors }: Options) {
    (globalThis as Record<string, unknown>).game = {
        user: { id: userId, isGM },
        users: new Map(users.map(u => [u.id, u])),
        actors: { get: (id: string) => actors[id] },
    };
}

function actor(id: string, ownership: Record<string, number> = {}, items: any[] = []) {
    return { id, ownership, name: id, items: { get: (itemId: string) => items.find(i => i.id === itemId) } };
}

function item(id: string, name = "Widget") {
    return { id, name };
}

afterEach(() => {
    delete (globalThis as Record<string, unknown>).game;
    delete (globalThis as Record<string, unknown>).ChatMessage;
    renderCtor.mockClear();
});

function mockChatMessage() {
    const create = vi.fn().mockResolvedValue({});
    (globalThis as Record<string, unknown>).ChatMessage = { create };
    return create;
}

describe("initiatePurchase", () => {
    it("opens the dialog directly when the dragger already controls both sides", async () => {
        const seller = actor("seller1", { gm1: 3 });
        const buyer = actor("buyer1", { gm1: 3 });
        setGame({ userId: "gm1", isGM: true, users: [{ id: "gm1", isGM: true, active: true }], actors: { seller1: seller, buyer1: buyer } });
        const create = mockChatMessage();

        await initiatePurchase(seller as any, buyer as any, item("i1") as any, 100);

        expect(renderCtor).toHaveBeenCalledWith(buyer, item("i1"), seller);
        expect(create).not.toHaveBeenCalled();
    });

    it("sends a purchase offer to the buyer when the seller is dragging their own item", async () => {
        const seller = actor("seller1", { player1: 3 });
        const buyer = actor("buyer1", { player2: 3 });
        setGame({
            userId: "player1", isGM: false,
            users: [{ id: "player1", isGM: false, active: true }, { id: "player2", isGM: false, active: true }],
            actors: { seller1: seller, buyer1: buyer },
        });
        const create = mockChatMessage();

        await initiatePurchase(seller as any, buyer as any, item("i1") as any, 100);

        expect(renderCtor).not.toHaveBeenCalled();
        expect(create).toHaveBeenCalledTimes(1);
        const call = create.mock.calls[0]![0];
        expect(call.whisper).toEqual(["player2"]);
        expect(call.flags.sr3e.purchaseOffer).toMatchObject({ sellerActorId: "seller1", buyerActorId: "buyer1", price: 100 });
    });

    it("sends a seller-consent request when the buyer is dragging someone else's item", async () => {
        const seller = actor("seller1", { player1: 3 });
        const buyer = actor("buyer1", { player2: 3 });
        setGame({
            userId: "player2", isGM: false,
            users: [{ id: "player1", isGM: false, active: true }, { id: "player2", isGM: false, active: true }],
            actors: { seller1: seller, buyer1: buyer },
        });
        const create = mockChatMessage();

        await initiatePurchase(seller as any, buyer as any, item("i1") as any, 100);

        expect(renderCtor).not.toHaveBeenCalled();
        expect(create).toHaveBeenCalledTimes(1);
        const call = create.mock.calls[0]![0];
        expect(call.whisper).toEqual(["player1"]);
        expect(call.flags.sr3e.sellerConsent).toMatchObject({ sellerActorId: "seller1", buyerActorId: "buyer1" });
    });

    it("opens the dialog directly when there is no seller (compendium/sidebar drop)", async () => {
        const buyer = actor("buyer1", { player1: 3 });
        setGame({ userId: "player1", isGM: false, users: [{ id: "player1", isGM: false, active: true }], actors: { buyer1: buyer } });
        const create = mockChatMessage();

        await initiatePurchase(undefined, buyer as any, item("i1") as any, 100);

        expect(renderCtor).toHaveBeenCalledWith(buyer, item("i1"), undefined);
        expect(create).not.toHaveBeenCalled();
    });
});

describe("handleSellerConsentResponse", () => {
    it("is a no-op for a viewer who doesn't control the seller", () => {
        const seller = actor("seller1", { player1: 3 });
        setGame({
            userId: "player2", isGM: false,
            users: [{ id: "player1", isGM: false, active: true }, { id: "player2", isGM: false, active: true }],
            actors: { seller1: seller },
        });
        const create = mockChatMessage();

        handleSellerConsentResponse(true, { sellerActorId: "seller1", buyerActorId: "buyer1", itemId: "i1", itemName: "Widget", price: 100 });

        expect(create).not.toHaveBeenCalled();
    });

    it("sends a purchase offer to the buyer on accept", () => {
        const theItem = item("i1");
        const seller = actor("seller1", { player1: 3 }, [theItem]);
        const buyer = actor("buyer1", { player2: 3 });
        setGame({
            userId: "player1", isGM: false,
            users: [{ id: "player1", isGM: false, active: true }, { id: "player2", isGM: false, active: true }],
            actors: { seller1: seller, buyer1: buyer },
        });
        const create = mockChatMessage();

        handleSellerConsentResponse(true, { sellerActorId: "seller1", buyerActorId: "buyer1", itemId: "i1", itemName: "Widget", price: 100 });

        expect(create).toHaveBeenCalledTimes(1);
        expect(create.mock.calls[0]![0].flags.sr3e.purchaseOffer).toMatchObject({ sellerActorId: "seller1", buyerActorId: "buyer1" });
    });

    it("posts a decline notice and does nothing else on decline", () => {
        const seller = actor("seller1", { player1: 3 });
        setGame({ userId: "player1", isGM: false, users: [{ id: "player1", isGM: false, active: true }], actors: { seller1: seller } });
        const create = mockChatMessage();

        handleSellerConsentResponse(false, { sellerActorId: "seller1", buyerActorId: "buyer1", itemId: "i1", itemName: "Widget", price: 100 });

        expect(create).toHaveBeenCalledTimes(1);
        expect(create.mock.calls[0]![0].flags).toBeUndefined();
    });
});

describe("handlePurchaseOfferResponse", () => {
    it("is a no-op for a viewer who doesn't control the buyer", async () => {
        const buyer = actor("buyer1", { player1: 3 });
        setGame({
            userId: "player2", isGM: false,
            users: [{ id: "player1", isGM: false, active: true }, { id: "player2", isGM: false, active: true }],
            actors: { buyer1: buyer },
        });

        await handlePurchaseOfferResponse(true, { sellerActorId: "seller1", buyerActorId: "buyer1", itemId: "i1", itemName: "Widget", price: 100 });

        expect(renderCtor).not.toHaveBeenCalled();
    });

    it("opens the purchase dialog for the buyer on accept", async () => {
        const theItem = item("i1");
        const seller = actor("seller1", {}, [theItem]);
        const buyer = actor("buyer1", { player1: 3 });
        setGame({ userId: "player1", isGM: false, users: [{ id: "player1", isGM: false, active: true }], actors: { seller1: seller, buyer1: buyer } });

        await handlePurchaseOfferResponse(true, { sellerActorId: "seller1", buyerActorId: "buyer1", itemId: "i1", itemName: "Widget", price: 100 });

        expect(renderCtor).toHaveBeenCalledWith(buyer, theItem, seller);
    });

    it("declines gracefully when the item is no longer on the seller", async () => {
        const seller = actor("seller1", {}, []);
        const buyer = actor("buyer1", { player1: 3 });
        setGame({ userId: "player1", isGM: false, users: [{ id: "player1", isGM: false, active: true }], actors: { seller1: seller, buyer1: buyer } });
        const create = mockChatMessage();

        await handlePurchaseOfferResponse(true, { sellerActorId: "seller1", buyerActorId: "buyer1", itemId: "i1", itemName: "Widget", price: 100 });

        expect(renderCtor).not.toHaveBeenCalled();
        expect(create).toHaveBeenCalledTimes(1);
    });
});
