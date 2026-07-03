import { formatNuyen } from "../../actors/actor-components/rats-race/ratRaceEconomy";

function responsePrompt(header: string, source: string): string {
    return `<div class="sr3e-defender-prompt" data-purchase-message="true">
  <div class="sr3e-defender-header">${header}</div>
  <div class="sr3e-defender-source">${source}</div>
  <div class="sr3e-defender-actions">
  <button class="sr3e-responder-button" data-purchase-response="accept"><span>Accept</span></button>
  <button class="sr3e-responder-button sr3e-responder-decline" data-purchase-response="decline"><span>Decline</span></button>
  </div>
</div>`;
}

export function renderSellerConsentPrompt(buyerName: string, itemName: string): string {
    return responsePrompt(
        `${itemName} — Give to ${buyerName}?`,
        `${buyerName} wants to take this from your inventory.`,
    );
}

export function renderPurchaseOfferPrompt(sellerName: string, itemName: string, price: number): string {
    return responsePrompt(
        `${itemName} — ${formatNuyen(price)}`,
        `${sellerName} offers to sell you this.`,
    );
}
