import { describe, expect, it, vi, afterEach } from "vitest";
import { commodityPrice, completePurchase, hasCommodityComponent, hasCommodityProfile } from "./purchase";

afterEach(() => { delete (globalThis as Record<string, unknown>).game; });

function commodityItem(overrides: Record<string, unknown> = {}) {
    const system = {
        commodity: { cost: 100, streetIndex: 2 },
        ...overrides,
    };
    return {
        id: "item1",
        name: "Ares Predator",
        system,
        toObject: vi.fn(() => ({ name: "Ares Predator", system })),
    };
}

function stick(amount: number) {
    const system = { amount };
    return {
        system,
        update: vi.fn(async (data: Record<string, unknown>) => {
            for (const [path, value] of Object.entries(data)) {
                (system as Record<string, unknown>)[path.replace("system.", "")] = value;
            }
        }),
    };
}

function actor(id = "actor1") {
    return {
        id,
        items: { get: (itemId: string) => (itemId === "item1" ? { id: itemId } : undefined) },
        createEmbeddedDocuments: vi.fn().mockResolvedValue([{}]),
        deleteEmbeddedDocuments: vi.fn().mockResolvedValue([{}]),
    };
}

// completePurchase relays seller-side mutations through sellerMutationRelay,
// which resolves the seller via game.actors.get and only writes directly when
// the current user is GM — mirrors the real cross-client permission boundary.
function setGameAsGM(seller: ReturnType<typeof actor>) {
    (globalThis as Record<string, unknown>).game = {
        user: { isGM: true },
        actors: { get: (id: string) => (id === seller.id ? seller : undefined) },
    };
}

describe("commodityPrice", () => {
    it("multiplies cost by streetIndex", () => {
        expect(commodityPrice(commodityItem())).toBe(200);
    });

    it("is 0 when the item has no commodity profile", () => {
        expect(commodityPrice(commodityItem({ commodity: undefined }))).toBe(0);
    });
});

describe("hasCommodityComponent", () => {
    it("is true regardless of price, including 0", () => {
        expect(hasCommodityComponent(commodityItem({ commodity: { cost: 0, streetIndex: 1 } }))).toBe(true);
    });

    it("is false without a commodity profile", () => {
        expect(hasCommodityComponent(commodityItem({ commodity: undefined }))).toBe(false);
    });
});

describe("hasCommodityProfile", () => {
    it("is true for a commodity with a positive price", () => {
        expect(hasCommodityProfile(commodityItem())).toBe(true);
    });

    it("is false when cost is 0", () => {
        expect(hasCommodityProfile(commodityItem({ commodity: { cost: 0, streetIndex: 1 } }))).toBe(false);
    });

    it("is false without a commodity profile", () => {
        expect(hasCommodityProfile(commodityItem({ commodity: undefined }))).toBe(false);
    });
});

describe("completePurchase — pay mode", () => {
    it("deducts price from the stick and embeds the item", async () => {
        const buyer = actor();
        const item = commodityItem();
        const paymentStick = stick(500);

        const result = await completePurchase(buyer, item, "pay", { price: 200, creditStick: paymentStick });

        expect(result.ok).toBe(true);
        expect(buyer.createEmbeddedDocuments).toHaveBeenCalledWith("Item", [item.toObject()]);
        expect(paymentStick.system.amount).toBe(300);
    });

    it("blocks the purchase when the stick balance is insufficient", async () => {
        const buyer = actor();
        const item = commodityItem();
        const paymentStick = stick(50);

        const result = await completePurchase(buyer, item, "pay", { price: 200, creditStick: paymentStick });

        expect(result.ok).toBe(false);
        expect(buyer.createEmbeddedDocuments).not.toHaveBeenCalled();
        expect(paymentStick.system.amount).toBe(50);
    });
});

describe("completePurchase — debt mode", () => {
    it("creates a debt transaction and embeds the item", async () => {
        const buyer = actor();
        const item = commodityItem();

        await completePurchase(buyer, item, "debt", { price: 200, creditorId: "actor2", interestPerMonth: 20 });

        expect(buyer.createEmbeddedDocuments).toHaveBeenCalledWith("Item", [item.toObject()]);
        expect(buyer.createEmbeddedDocuments).toHaveBeenCalledWith("Item", [
            expect.objectContaining({
                name: "Ares Predator — Debt",
                type: "transaction",
                system: expect.objectContaining({
                    amount: 200,
                    originalAmount: 200,
                    type: "debt",
                    creditorId: "actor2",
                    interestPerMonth: 20,
                }),
            }),
        ]);
    });
});

describe("completePurchase — free mode", () => {
    it("embeds the item with no transaction created", async () => {
        const buyer = actor();
        const item = commodityItem();

        await completePurchase(buyer, item, "free", { price: 0 });

        expect(buyer.createEmbeddedDocuments).toHaveBeenCalledTimes(1);
        expect(buyer.createEmbeddedDocuments).toHaveBeenCalledWith("Item", [item.toObject()]);
    });
});

describe("completePurchase — actor-to-actor", () => {
    it("deletes the source item from the seller unconditionally", async () => {
        const buyer = actor("buyer1");
        const seller = actor("seller1");
        setGameAsGM(seller);
        const item = commodityItem();

        await completePurchase(buyer, item, "free", { price: 0 }, seller);

        expect(seller.deleteEmbeddedDocuments).toHaveBeenCalledWith("Item", ["item1"]);
        expect(seller.createEmbeddedDocuments).not.toHaveBeenCalled();
    });

    it("mints a sale-proceeds credit stick on the seller for a pay-mode sale", async () => {
        const buyer = actor("buyer1");
        const seller = actor("seller1");
        setGameAsGM(seller);
        const item = commodityItem();
        const paymentStick = stick(500);

        await completePurchase(buyer, item, "pay", { price: 200, creditStick: paymentStick }, seller);

        expect(seller.deleteEmbeddedDocuments).toHaveBeenCalledWith("Item", ["item1"]);
        expect(seller.createEmbeddedDocuments).toHaveBeenCalledWith("Item", [
            expect.objectContaining({
                name: "Ares Predator — Sale Proceeds",
                system: expect.objectContaining({ amount: 200, isCreditStick: true }),
            }),
        ]);
    });

    it("does not mint a proceeds stick for a debt-mode sale", async () => {
        const buyer = actor("buyer1");
        const seller = actor("seller1");
        setGameAsGM(seller);
        const item = commodityItem();

        await completePurchase(buyer, item, "debt", { price: 200, creditorId: "actor2" }, seller);

        expect(seller.deleteEmbeddedDocuments).toHaveBeenCalledWith("Item", ["item1"]);
        expect(seller.createEmbeddedDocuments).not.toHaveBeenCalled();
    });

    it("relays the seller-side write over socket when the current user is not GM", async () => {
        const buyer = actor("buyer1");
        const seller = actor("seller1");
        const emit = vi.fn();
        (globalThis as Record<string, unknown>).game = { user: { isGM: false }, socket: { emit } };
        const item = commodityItem();

        await completePurchase(buyer, item, "free", { price: 0 }, seller);

        expect(seller.deleteEmbeddedDocuments).not.toHaveBeenCalled();
        expect(emit).toHaveBeenCalledWith("system.sr3e", { type: "purchaseSellerDelete", sellerActorId: "seller1", itemId: "item1" });
    });
});
