import { handleDefenderChoice } from "../../services/combat/orchestration/defenderFlow";
import {
    handleResistanceClick,
    type ResistanceCtx,
} from "../../services/combat/orchestration/resistanceHandler";
import { handleKarmaPoolReroll, handleKarmaPoolRerollSelected, handleKarmaBuySuccess, type RerollFlag } from "../../services/combat/orchestration/rerollHandler";
import { handleContestReroll, handleContestBuy, handleContestDone, type ContestOutcomeFlag, type ContestSide } from "../../services/combat/orchestration/contestRerollHandler";
import { handleDrainReroll, handleDrainBuy, handleDrainDone, type DrainOutcomeFlag } from "../../services/spells/drainRerollHandler";
import { handleResistanceReroll, handleResistanceBuy, handleResistanceDone, type ResistanceOutcomeFlag } from "../../services/combat/orchestration/resistanceRerollHandler";
import { requestMessageUpdate } from "../../services/combat/orchestration/messageRelay";
import { getContest, isActorLockedForCurrentUser } from "../../services/combat/engine/contestCoordinator";
import { handlePurchaseOfferResponse, handleSellerConsentResponse, type PurchaseOfferFlag } from "../../services/economy/purchaseOfferFlow";
import { withDiePending } from "./diePendingState";
import { wrapChatMessage } from "./wrapChatMessage";

type ChatMessageLike = {
    flags?: { sr3e?: Record<string, unknown> };
    update?: (data: Record<string, unknown>) => Promise<unknown>;
    author?: { color?: unknown } | null;
};

type HookRegistrar = {
    on(event: string, callback: (message: ChatMessageLike, html: HTMLElement) => void): unknown;
};

function consumeCard(container: HTMLElement): boolean {
    if (container.dataset.sr3eConsumed) return false;
    container.dataset.sr3eConsumed = "true";
    container.querySelectorAll<HTMLButtonElement>("button").forEach(b => { b.disabled = true; });
    return true;
}

function disableAllButtons(html: HTMLElement): void {
    html.querySelectorAll<HTMLButtonElement>("button").forEach(b => { b.disabled = true; });
}

// Applies to every viewer, not just the GM: disables this subtree's buttons
// and marks it so CSS can grey out its dice, on THIS client only — every
// client runs this hook independently against its own game.user, so the
// controlling user's own view of the same message is untouched. The actual
// authorization (canCurrentUserActFor, checked in every handler below) is
// what actually prevents the action; this only prevents anyone else from
// being tempted to click a no-op.
function lockSubtreeForViewer(el: HTMLElement): void {
    el.dataset.sr3eLocked = "true";
    el.title = "Locked — controlled by someone else";
    el.querySelectorAll<HTMLButtonElement>("button").forEach(b => { b.disabled = true; });
}

// Every client renders this message independently, but all read the same
// author.color off the message document, so the shadow is consistently that
// sender's color everywhere rather than only on the sending client.
function applySenderShadowColor(message: ChatMessageLike, html: HTMLElement): void {
    const color = message.author?.color;
    if (!color) return;

    const chatMessageEl = html.closest<HTMLElement>(".chat-message") ?? html;
    chatMessageEl.style.setProperty("--sender-shadow-color", String(color));
}

function lockForCurrentViewerIfNeeded(message: ChatMessageLike, html: HTMLElement): void {
    const flags = message.flags?.sr3e;
    if (!flags) return;

    const contestOutcome = flags.contestOutcome as ContestOutcomeFlag | undefined;
    if (contestOutcome) {
        (["initiator", "target"] as const).forEach(side => {
            if (!isActorLockedForCurrentUser(contestOutcome[side].actorId)) return;
            const sideEl = html.querySelector<HTMLElement>(`[data-side="${side}"]`);
            if (sideEl) lockSubtreeForViewer(sideEl);
        });
        return;
    }

    const drainOutcome = flags.drainOutcome as DrainOutcomeFlag | undefined;
    if (drainOutcome && isActorLockedForCurrentUser(drainOutcome.actorId)) {
        lockSubtreeForViewer(html);
        return;
    }

    const resistanceOutcome = flags.resistanceOutcome as ResistanceOutcomeFlag | undefined;
    if (resistanceOutcome && isActorLockedForCurrentUser(resistanceOutcome.actorId)) {
        lockSubtreeForViewer(html);
        return;
    }

    const damageResistance = flags.damageResistance as ResistanceCtx | undefined;
    if (damageResistance && isActorLockedForCurrentUser(damageResistance.defenderActorId)) {
        lockSubtreeForViewer(html);
        return;
    }

    const reroll = flags.reroll as RerollFlag | undefined;
    if (reroll && isActorLockedForCurrentUser(reroll.actorId)) {
        lockSubtreeForViewer(html);
        return;
    }

    const opposedContestId = flags.opposed as string | undefined;
    if (opposedContestId) {
        const targetActorId = getContest(opposedContestId)?.target?.id;
        if (isActorLockedForCurrentUser(targetActorId)) lockSubtreeForViewer(html);
        return;
    }

    const sellerConsent = flags.sellerConsent as PurchaseOfferFlag | undefined;
    if (sellerConsent && isActorLockedForCurrentUser(sellerConsent.sellerActorId)) {
        lockSubtreeForViewer(html);
        return;
    }

    const purchaseOffer = flags.purchaseOffer as PurchaseOfferFlag | undefined;
    if (purchaseOffer && isActorLockedForCurrentUser(purchaseOffer.buyerActorId)) {
        lockSubtreeForViewer(html);
    }
}

function persistConsumedToMessage(promptEl: HTMLElement): void {
    const msgEl = promptEl.closest<HTMLElement>(".chat-message");
    const messageId = msgEl?.dataset?.messageId;
    if (!messageId) return;
    requestMessageUpdate(messageId, { "flags.sr3e.consumed": true });
}

function getLiveMessage(messageId: string): ChatMessageLike | undefined {
    return (globalThis as Record<string, unknown> & { game?: { messages?: { get: (id: string) => ChatMessageLike | undefined } } })
        .game?.messages?.get(messageId);
}

// All interactive wiring below uses document-level click delegation, reading
// the message's CURRENT flags fresh at click time via game.messages.get()
// instead of attaching per-element listeners bound to render-time closures.
// This is required, not just convenient: renderChatMessageHTML does not fire
// for every DOM instance a message appears in — e.g. Foundry's roll/chat
// notification popups render their own copy without it — so per-element
// listeners silently never attach there, while the main chat log's copy
// works fine. Delegation on `document` fires regardless of which surface the
// click lands on, and as a bonus is immune to stale-closure data too.

function registerResponderDelegation(): void {
    document.addEventListener("click", (event) => {
        const button = (event.target as HTMLElement).closest<HTMLElement>("[data-responder]");
        if (!button) return;
        const prompt = button.closest<HTMLElement>("[data-contest-id]");
        if (!prompt) return;
        if (!consumeCard(prompt)) return;
        persistConsumedToMessage(prompt);
        const contestId = prompt.dataset.contestId ?? "";
        const key = button.dataset.responder ?? null;
        if (contestId) handleDefenderChoice(contestId, key);
    });
}

function registerPurchaseResponseDelegation(): void {
    document.addEventListener("click", (event) => {
        const button = (event.target as HTMLElement).closest<HTMLElement>("[data-purchase-response]");
        if (!button) return;
        const prompt = button.closest<HTMLElement>("[data-purchase-message]");
        if (!prompt) return;
        const messageId = prompt.closest<HTMLElement>(".chat-message")?.dataset?.messageId;
        if (!messageId) return;

        const flags = getLiveMessage(messageId)?.flags?.sr3e;
        if (!flags || flags.consumed) return;

        if (!consumeCard(prompt)) return;
        persistConsumedToMessage(prompt);

        const accepted = button.dataset.purchaseResponse === "accept";

        const sellerConsent = flags.sellerConsent as PurchaseOfferFlag | undefined;
        if (sellerConsent) {
            handleSellerConsentResponse(accepted, sellerConsent);
            return;
        }

        const purchaseOffer = flags.purchaseOffer as PurchaseOfferFlag | undefined;
        if (purchaseOffer) void handlePurchaseOfferResponse(accepted, purchaseOffer);
    });
}

function registerResistanceButtonDelegation(): void {
    document.addEventListener("click", (event) => {
        const btn = (event.target as HTMLElement).closest<HTMLElement>(".sr3e-resist-damage-button");
        if (!btn) return;
        const card = btn.closest<HTMLElement>(".sr3e-resistance-prompt") ?? btn;
        if (!consumeCard(card)) return;

        const messageId = card.closest<HTMLElement>(".chat-message")?.dataset?.messageId;
        if (!messageId) return;
        requestMessageUpdate(messageId, { "flags.sr3e.consumed": true });

        const resistance = getLiveMessage(messageId)?.flags?.sr3e?.damageResistance as ResistanceCtx | undefined;
        if (resistance) handleResistanceClick(resistance);
    });
}

// Simple/open rolls only: right-click toggles a die into the reroll selection
// (yellow inset, see .sr3e-die[data-selected] in chat.scss). Left-click on any
// die then fires the reroll for exactly the marked dice — see registerDieClickDelegation.
//
// Registered on the CAPTURE phase: Foundry's own chat-message context menu is
// bound closer to the message element and would otherwise win the bubble-phase
// race and open before this handler ever runs. Capture always fires first
// regardless of DOM position, and stopPropagation here (only once a die is
// confirmed under the cursor) keeps the event from ever reaching Foundry's
// bubble-phase listener.
function registerDieSelectionDelegation(): void {
    document.addEventListener("contextmenu", (event) => {
        const die = (event.target as HTMLElement).closest<HTMLElement>(".sr3e-die");
        if (!die) return;
        const msgEl = die.closest<HTMLElement>(".chat-message");
        const messageId = msgEl?.dataset?.messageId;
        if (!messageId) return;

        const message = getLiveMessage(messageId);
        const sr3eFlags = message?.flags?.sr3e;
        if (!message || !sr3eFlags || sr3eFlags.consumed) return;

        const reroll = sr3eFlags.reroll as RerollFlag | undefined;
        if (!reroll || reroll.pipeline !== "simple") return;

        event.preventDefault();
        event.stopPropagation();
        if (die.dataset.selected) delete die.dataset.selected;
        else die.dataset.selected = "true";
    }, true);
}

function registerDieClickDelegation(): void {
    document.addEventListener("click", (event) => {
        const die = (event.target as HTMLElement).closest<HTMLElement>(".sr3e-die");
        if (!die) return;
        const msgEl = die.closest<HTMLElement>(".chat-message");
        const messageId = msgEl?.dataset?.messageId;
        if (!messageId) return;

        const message = getLiveMessage(messageId);
        const sr3eFlags = message?.flags?.sr3e;
        if (!message || !sr3eFlags || sr3eFlags.consumed) return;

        const isBuy = (event as MouseEvent).shiftKey;

        const reroll = sr3eFlags.reroll as RerollFlag | undefined;
        if (reroll) {
            const group = msgEl?.querySelector<HTMLElement>(".sr3e-roll-dice") ?? msgEl;
            const updatableMessage = message as { update: (d: Record<string, unknown>) => Promise<unknown> };

            if (isBuy) {
                withDiePending(group, () => handleKarmaBuySuccess(updatableMessage, reroll));
                return;
            }

            if (reroll.pipeline === "simple") {
                const selectedIndices = Array.from(group?.querySelectorAll<HTMLElement>(".sr3e-die[data-selected]") ?? [])
                    .map(el => Number(el.dataset.dieIndex));
                withDiePending(group, () => handleKarmaPoolRerollSelected(updatableMessage, reroll, selectedIndices));
                return;
            }

            withDiePending(group, () => handleKarmaPoolReroll(updatableMessage, reroll));
            return;
        }

        const contestOutcome = sr3eFlags.contestOutcome as ContestOutcomeFlag | undefined;
        if (contestOutcome) {
            const sideEl = die.closest<HTMLElement>("[data-side]");
            const side = sideEl?.dataset.side as ContestSide | undefined;
            if (!side || contestOutcome[side].done) return;
            withDiePending(sideEl, () => isBuy ? handleContestBuy(messageId, contestOutcome, side) : handleContestReroll(messageId, contestOutcome, side));
            return;
        }

        const drainOutcome = sr3eFlags.drainOutcome as DrainOutcomeFlag | undefined;
        if (drainOutcome) {
            const group = msgEl?.querySelector<HTMLElement>(".sr3e-roll-dice") ?? msgEl;
            withDiePending(group, () => isBuy ? handleDrainBuy(messageId, drainOutcome) : handleDrainReroll(messageId, drainOutcome));
            return;
        }

        const resistanceOutcome = sr3eFlags.resistanceOutcome as ResistanceOutcomeFlag | undefined;
        if (resistanceOutcome) {
            const group = msgEl?.querySelector<HTMLElement>(".sr3e-roll-dice") ?? msgEl;
            withDiePending(group, () => isBuy ? handleResistanceBuy(messageId, resistanceOutcome) : handleResistanceReroll(messageId, resistanceOutcome));
        }
    });
}

function registerContestDoneDelegation(): void {
    document.addEventListener("click", (event) => {
        const btn = (event.target as HTMLElement).closest<HTMLElement>("[data-contest-done]");
        if (!btn) return;
        const msgEl = btn.closest<HTMLElement>(".chat-message");
        const messageId = msgEl?.dataset?.messageId;
        if (!messageId) return;

        const message = getLiveMessage(messageId);
        const contestOutcome = message?.flags?.sr3e?.contestOutcome as ContestOutcomeFlag | undefined;
        if (!message || !contestOutcome || message.flags?.sr3e?.consumed) return;

        const sideEl = btn.closest<HTMLElement>("[data-side]");
        const side = sideEl?.dataset.side as ContestSide | undefined;
        if (!side) return;

        withDiePending(sideEl, () => handleContestDone(messageId, contestOutcome, side));
    });
}

function registerDrainDoneDelegation(): void {
    document.addEventListener("click", (event) => {
        const btn = (event.target as HTMLElement).closest<HTMLElement>("[data-drain-done]");
        if (!btn) return;
        const msgEl = btn.closest<HTMLElement>(".chat-message");
        const messageId = msgEl?.dataset?.messageId;
        if (!messageId) return;

        const drainOutcome = getLiveMessage(messageId)?.flags?.sr3e?.drainOutcome as DrainOutcomeFlag | undefined;
        if (!drainOutcome) return;
        if (!msgEl || !consumeCard(msgEl)) return;

        persistConsumedToMessage(msgEl);
        void handleDrainDone(drainOutcome);
    });
}

function registerResistanceDoneDelegation(): void {
    document.addEventListener("click", (event) => {
        const btn = (event.target as HTMLElement).closest<HTMLElement>("[data-resistance-done]");
        if (!btn) return;
        const msgEl = btn.closest<HTMLElement>(".chat-message");
        const messageId = msgEl?.dataset?.messageId;
        if (!messageId) return;

        const resistanceOutcome = getLiveMessage(messageId)?.flags?.sr3e?.resistanceOutcome as ResistanceOutcomeFlag | undefined;
        if (!resistanceOutcome) return;
        if (!msgEl || !consumeCard(msgEl)) return;

        persistConsumedToMessage(msgEl);
        void handleResistanceDone(resistanceOutcome);
    });
}

export function handleChatMessageHTML(message: ChatMessageLike, html: HTMLElement): void {
    wrapChatMessage(html);

    if (message.flags?.sr3e?.consumed) {
        disableAllButtons(html);
        html.dataset.sr3eConsumed = "true";
    }

    applySenderShadowColor(message, html);
    lockForCurrentViewerIfNeeded(message, html);
}

export function registerChatMessageHTMLHook(registrar: HookRegistrar = Hooks): void {
    registrar.on("renderChatMessageHTML", handleChatMessageHTML);
    registerResponderDelegation();
    registerPurchaseResponseDelegation();
    registerResistanceButtonDelegation();
    registerDieSelectionDelegation();
    registerDieClickDelegation();
    registerDrainDoneDelegation();
    registerContestDoneDelegation();
    registerResistanceDoneDelegation();
}
