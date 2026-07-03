// The buyer's client runs completePurchase (after the seller has already
// consented via chat), but Foundry only lets an actor's owner — not an
// arbitrary buyer — create/delete that actor's embedded items. Same shape of
// problem as ChatMessage's author-or-GM restriction (messageRelay.ts): any
// client that isn't the seller's owner routes the write through the GM's
// client via socket instead of mutating the seller directly.

const SOCKET_EVENT = "system.sr3e";

type SellerMutationPayload =
    | { type: "purchaseSellerDelete"; sellerActorId: string; itemId: string }
    | { type: "purchaseSellerCreate"; sellerActorId: string; data: Record<string, unknown> };

function currentUserIsGM(): boolean {
    return !!(typeof game !== "undefined" ? (game.user as unknown as { isGM?: boolean } | undefined)?.isGM : false);
}

function getSeller(sellerActorId: string): Actor | undefined {
    if (typeof game === "undefined" || !game.actors) return undefined;
    return (game.actors.get(sellerActorId) as Actor | undefined) ?? undefined;
}

// Idempotent by design: if two GM sessions are connected, both receive the
// same broadcasted delete request and would otherwise race to delete an
// already-deleted item, which Foundry rejects with a hard "does not exist"
// error instead of a no-op. Checking first makes a duplicate delivery safe.
async function deleteSellerItem(sellerActorId: string, itemId: string): Promise<void> {
    const seller = getSeller(sellerActorId);
    if (!seller?.items?.get(itemId)) return;
    await seller.deleteEmbeddedDocuments?.("Item", [itemId]);
}

async function createSellerItem(sellerActorId: string, data: Record<string, unknown>): Promise<void> {
    await getSeller(sellerActorId)?.createEmbeddedDocuments?.("Item", [data]);
}

export async function requestSellerDelete(sellerActorId: string, itemId: string): Promise<void> {
    if (currentUserIsGM()) {
        await deleteSellerItem(sellerActorId, itemId);
        return;
    }

    (game.socket as unknown as { emit: (event: string, data: unknown) => void } | undefined)
        ?.emit(SOCKET_EVENT, { type: "purchaseSellerDelete", sellerActorId, itemId });
}

export async function requestSellerCreate(sellerActorId: string, data: Record<string, unknown>): Promise<void> {
    if (currentUserIsGM()) {
        await createSellerItem(sellerActorId, data);
        return;
    }

    (game.socket as unknown as { emit: (event: string, data: unknown) => void } | undefined)
        ?.emit(SOCKET_EVENT, { type: "purchaseSellerCreate", sellerActorId, data });
}

// Registered as its own listener on the shared "system.sr3e" channel rather
// than folded into combat's socketHandlers.ts switch — economy payload types
// are simply ignored by that listener's fallthrough, and vice versa here.
export function registerSellerMutationRelay(): void {
    if (typeof game === "undefined" || !game.socket) return;

    (game.socket as unknown as { on: (event: string, handler: (payload: unknown) => void) => void })
        .on(SOCKET_EVENT, (payload: unknown) => {
            if (!currentUserIsGM()) return;

            const p = payload as SellerMutationPayload;
            if (p.type === "purchaseSellerDelete") {
                void deleteSellerItem(p.sellerActorId, p.itemId);
            } else if (p.type === "purchaseSellerCreate") {
                void createSellerItem(p.sellerActorId, p.data);
            }
        });
}
