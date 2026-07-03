import { requestSellerCreate, requestSellerDelete } from "./sellerMutationRelay";

type TransactionLike = {
    system: { amount: number };
    update?: (data: Record<string, unknown>) => Promise<unknown>;
};

type ActorLike = {
    id?: string;
    createEmbeddedDocuments?: (type: string, data: unknown[]) => Promise<unknown[]>;
    deleteEmbeddedDocuments?: (type: string, ids: string[]) => Promise<unknown[]>;
};

type CommodityItem = {
    id?: string;
    name?: string;
    system: { commodity?: { cost: number; streetIndex: number } };
    toObject: () => Record<string, unknown>;
};

export type PurchaseMode = "pay" | "debt" | "free";

export type PurchaseDetails = {
    price: number;
    creditStick?: TransactionLike;
    creditorId?: string;
    interestPerMonth?: number;
};

export function commodityPrice(item: CommodityItem): number {
    const commodity = item.system?.commodity;
    return commodity ? commodity.cost * commodity.streetIndex : 0;
}

export function hasCommodityComponent(item: CommodityItem | null | undefined): boolean {
    return Boolean(item?.system?.commodity);
}

export function hasCommodityProfile(item: CommodityItem | null | undefined): boolean {
    return hasCommodityComponent(item) && commodityPrice(item as CommodityItem) > 0;
}

export async function completePurchase(
    buyer: ActorLike,
    item: CommodityItem,
    mode: PurchaseMode,
    details: PurchaseDetails,
    seller?: ActorLike,
): Promise<{ ok: boolean }> {
    if (mode === "pay" && (!details.creditStick || details.creditStick.system.amount < details.price)) {
        return { ok: false };
    }

    await buyer.createEmbeddedDocuments?.("Item", [item.toObject()]);

    if (mode === "pay" && details.creditStick) {
        await details.creditStick.update?.({
            "system.amount": details.creditStick.system.amount - details.price,
        });
    }

    if (mode === "debt") {
        await buyer.createEmbeddedDocuments?.("Item", [{
            name: `${item.name ?? "Item"} — Debt`,
            type: "transaction",
            system: {
                amount: details.price,
                originalAmount: details.price,
                type: "debt",
                recurrent: false,
                isCreditStick: false,
                creditorId: details.creditorId ?? "",
                interestPerMonth: details.interestPerMonth ?? 0,
            },
        }]);
    }

    if (seller?.id && item.id) {
        await requestSellerDelete(seller.id, item.id);

        if (mode === "pay") {
            await requestSellerCreate(seller.id, {
                name: `${item.name ?? "Item"} — Sale Proceeds`,
                type: "transaction",
                system: {
                    amount: details.price,
                    type: "asset",
                    recurrent: false,
                    isCreditStick: true,
                    creditorId: "",
                    interestPerMonth: 0,
                },
            });
        }
    }

    return { ok: true };
}
