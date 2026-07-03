import { canCurrentUserActFor, resolveControllingUser } from "../combat/engine/contestCoordinator";
import { renderPurchaseOfferPrompt, renderSellerConsentPrompt } from "../../ui/economy/chat/renderPurchasePrompts";

export type PurchaseOfferFlag = {
    sellerActorId: string;
    buyerActorId: string;
    itemId: string;
    itemName: string;
    price: number;
};

type ChatMessageStatic = { create: (data: Record<string, unknown>) => Promise<unknown> };

function resolveActor(actorId: string): Actor | undefined {
    if (typeof game === "undefined" || !game.actors) return undefined;
    return (game.actors.get(actorId) as Actor | undefined) ?? undefined;
}

async function postNotice(content: string): Promise<void> {
    if (typeof ChatMessage === "undefined") return;
    await (ChatMessage as unknown as ChatMessageStatic).create({ content });
}

// Dynamically imported so this pure-logic module never forces PurchaseDialogApp's
// `extends foundry.applications.api.ApplicationV2` to evaluate at import time —
// that class field only resolves inside a live Foundry runtime, and a static
// import here would poison any unit test that merely imports this file.
async function openPurchaseDialog(buyer: Actor, item: Item, seller: Actor | undefined): Promise<void> {
    const { PurchaseDialogApp } = await import("../../sheets/actors/PurchaseDialogApp");
    new PurchaseDialogApp(buyer, item, seller).render(true);
}

// Entry point from CharacterSheet's drop handler. Whichever side of the trade
// did NOT perform the drag must consent before anything is embedded/deleted —
// dragging is only ever implicit consent for the side doing the dragging.
export async function initiatePurchase(
    seller: Actor | undefined,
    buyer: Actor,
    item: Item,
    price: number,
): Promise<void> {
    if (seller && !canCurrentUserActFor(seller as never)) {
        await sendSellerConsentRequest(seller, buyer, item, price);
        return;
    }

    if (seller && !canCurrentUserActFor(buyer as never)) {
        await sendPurchaseOffer(seller, buyer, item, price);
        return;
    }

    await openPurchaseDialog(buyer, item, seller);
}

async function sendSellerConsentRequest(seller: Actor, buyer: Actor, item: Item, price: number): Promise<void> {
    const controller = resolveControllingUser(seller as never);
    if (!controller) return;

    const flag: PurchaseOfferFlag = {
        sellerActorId: seller.id ?? "",
        buyerActorId: buyer.id ?? "",
        itemId: item.id ?? "",
        itemName: item.name ?? "Item",
        price,
    };

    await (ChatMessage as unknown as ChatMessageStatic).create({
        content: renderSellerConsentPrompt(buyer.name ?? "Someone", item.name ?? "Item"),
        whisper: [controller.id as string],
        flags: { sr3e: { sellerConsent: flag } },
    });
}

async function sendPurchaseOffer(seller: Actor, buyer: Actor, item: Item, price: number): Promise<void> {
    const controller = resolveControllingUser(buyer as never);
    if (!controller) return;

    const flag: PurchaseOfferFlag = {
        sellerActorId: seller.id ?? "",
        buyerActorId: buyer.id ?? "",
        itemId: item.id ?? "",
        itemName: item.name ?? "Item",
        price,
    };

    await (ChatMessage as unknown as ChatMessageStatic).create({
        content: renderPurchaseOfferPrompt(seller.name ?? "Someone", item.name ?? "Item", price),
        whisper: [controller.id as string],
        flags: { sr3e: { purchaseOffer: flag } },
    });
}

export function handleSellerConsentResponse(accepted: boolean, flag: PurchaseOfferFlag): void {
    const seller = resolveActor(flag.sellerActorId);
    if (!canCurrentUserActFor((seller ?? null) as never)) return;

    if (!accepted) {
        void postNotice(`<p>${flag.itemName}: the owner declined to sell.</p>`);
        return;
    }

    const buyer = resolveActor(flag.buyerActorId);
    const item = seller?.items?.get(flag.itemId) as Item | undefined;
    if (!seller || !buyer || !item) {
        void postNotice(`<p>${flag.itemName} is no longer available.</p>`);
        return;
    }

    void sendPurchaseOffer(seller, buyer, item, flag.price);
}

export async function handlePurchaseOfferResponse(accepted: boolean, flag: PurchaseOfferFlag): Promise<void> {
    const buyer = resolveActor(flag.buyerActorId);
    if (!canCurrentUserActFor((buyer ?? null) as never)) return;

    if (!accepted) {
        await postNotice(`<p>${flag.itemName}: offer declined.</p>`);
        return;
    }

    const seller = resolveActor(flag.sellerActorId);
    const item = seller?.items?.get(flag.itemId) as Item | undefined;
    if (!buyer || !item) {
        await postNotice(`<p>${flag.itemName} is no longer available.</p>`);
        return;
    }

    await openPurchaseDialog(buyer, item, seller);
}
