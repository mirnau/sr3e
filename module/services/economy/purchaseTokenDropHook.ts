import { commodityPrice, hasCommodityComponent, hasCommodityProfile } from "./purchase";
import { initiatePurchase } from "./purchaseOfferFlow";

// Players generally cannot open another player's character sheet (no Observer/
// Owner permission by default), so the sheet-drop path in CharacterSheet.ts
// only ever fires for GM-mediated trades or shared-visibility tables. Dropping
// an item onto a token only requires SEEING the token on the shared canvas —
// the same permission-free gesture already used by registerMedicalTokenDropHook
// (applyMedical.ts) — so this is the actual path most player-to-player
// purchases/gifts go through.
export function registerPurchaseTokenDropHook(): void {
    Hooks.on("dropCanvasData", async (_canvas: unknown, data: Record<string, unknown>) => {
        if (data.type !== "Item") return;

        const item = await (Item as any).fromDropData(data) as Item | null;
        if (!item || item.type === "medical") return;

        const pos = data as { x?: number; y?: number };
        const token = (canvas as any)?.tokens?.placeables?.find((t: any) => {
            const b = t.bounds ?? t.hitArea;
            return b && pos.x !== undefined && pos.y !== undefined && b.contains(pos.x, pos.y);
        });

        const buyer = token?.actor as Actor | undefined;
        if (!buyer) return;

        const seller = item.parent instanceof Actor ? item.parent as Actor : undefined;
        if (seller && seller.id === buyer.id) return;

        // Same combined gate as CharacterSheet.ts's sheet-drop path: a priced
        // commodity always qualifies (vendor/compendium sale), a free one only
        // qualifies when it's actually moving between two actors (a gift).
        if (!hasCommodityProfile(item as any) && !(seller && hasCommodityComponent(item as any))) return;

        await initiatePurchase(seller, buyer, item, commodityPrice(item as any));
        return false;
    });
}
