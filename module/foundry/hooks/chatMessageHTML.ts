import { handleDefenderChoice } from "../../services/combat/orchestration/defenderFlow";
import {
    handleResistanceClick,
    type ResistanceCtx,
} from "../../services/combat/orchestration/resistanceHandler";
import { handleKarmaPoolReroll, handleKarmaBuySuccess, type RerollFlag } from "../../services/combat/orchestration/rerollHandler";
import { handleContestReroll, handleContestBuy, type ContestOutcomeFlag, type ContestSide } from "../../services/combat/orchestration/contestRerollHandler";
import { handleDrainReroll, handleDrainBuy, handleDrainDone, type DrainOutcomeFlag } from "../../services/spells/drainRerollHandler";
import { requestMessageUpdate } from "../../services/combat/orchestration/messageRelay";
import { withDiePending } from "./diePendingState";

type ChatMessageLike = {
    flags?: { sr3e?: Record<string, unknown> };
    update?: (data: Record<string, unknown>) => Promise<unknown>;
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
            withDiePending(group, () => isBuy ? handleKarmaBuySuccess(message as { update: (d: Record<string, unknown>) => Promise<unknown> }, reroll)
                : handleKarmaPoolReroll(message as { update: (d: Record<string, unknown>) => Promise<unknown> }, reroll));
            return;
        }

        const contestOutcome = sr3eFlags.contestOutcome as ContestOutcomeFlag | undefined;
        if (contestOutcome) {
            const sideEl = die.closest<HTMLElement>("[data-side]");
            const side = sideEl?.dataset.side as ContestSide | undefined;
            if (!side) return;
            withDiePending(sideEl, () => isBuy ? handleContestBuy(messageId, contestOutcome, side) : handleContestReroll(messageId, contestOutcome, side));
            return;
        }

        const drainOutcome = sr3eFlags.drainOutcome as DrainOutcomeFlag | undefined;
        if (drainOutcome) {
            const group = msgEl?.querySelector<HTMLElement>(".sr3e-roll-dice") ?? msgEl;
            withDiePending(group, () => isBuy ? handleDrainBuy(messageId, drainOutcome) : handleDrainReroll(messageId, drainOutcome));
        }
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

export function handleChatMessageHTML(message: ChatMessageLike, html: HTMLElement): void {
    if (message.flags?.sr3e?.consumed) {
        disableAllButtons(html);
        html.dataset.sr3eConsumed = "true";
    }
}

export function registerChatMessageHTMLHook(registrar: HookRegistrar = Hooks): void {
    registrar.on("renderChatMessageHTML", handleChatMessageHTML);
    registerResponderDelegation();
    registerResistanceButtonDelegation();
    registerDieClickDelegation();
    registerDrainDoneDelegation();
}
