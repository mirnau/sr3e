import { handleDefenderChoice } from "../../services/combat/orchestration/defenderFlow";
import {
    handleResistanceClick,
    type ResistanceCtx,
} from "../../services/combat/orchestration/resistanceHandler";
import { handleKarmaPoolReroll, handleKarmaBuySuccess, type RerollFlag } from "../../services/combat/orchestration/rerollHandler";

type ChatMessageLike = {
    flags?: {
        sr3e?: Record<string, unknown>;
    };
    setFlag?: (scope: string, key: string, value: unknown) => Promise<unknown>;
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

// Persists consumed state so renderChatMessageHTML re-disables on every re-render.
function persistConsumedToMessage(promptEl: HTMLElement): void {
    const msgEl = promptEl.closest<HTMLElement>(".chat-message");
    const messageId = msgEl?.dataset?.messageId;
    if (!messageId) return;
    (globalThis as Record<string, unknown> & { game?: { messages?: { get: (id: string) => ChatMessageLike | undefined } } })
        .game?.messages?.get(messageId)?.setFlag?.("sr3e", "consumed", true);
}

// Document-level delegation handles [data-responder] clicks in both the chat log
// and Foundry's whisper notification popups (which don't fire renderChatMessageHTML).
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

export function handleChatMessageHTML(message: ChatMessageLike, html: HTMLElement): void {
    const sr3eFlags = message.flags?.sr3e;
    if (!sr3eFlags) return;

    if (sr3eFlags.consumed) {
        disableAllButtons(html);
        return;
    }

    const resistance = sr3eFlags.damageResistance as ResistanceCtx | undefined;
    if (resistance) {
        const btn = html.querySelector<HTMLButtonElement>(".sr3e-resist-damage-button");
        btn?.addEventListener("click", () => {
            const card = btn.closest<HTMLElement>(".sr3e-resistance-prompt") ?? html;
            if (!consumeCard(card)) return;
            message.setFlag?.("sr3e", "consumed", true);
            handleResistanceClick(resistance);
        });
    }

    const reroll = sr3eFlags.reroll as RerollFlag | undefined;
    if (reroll) {
        const msg = message as unknown as { update: (d: Record<string, unknown>) => Promise<unknown> };
        html.querySelectorAll<HTMLElement>(".sr3e-die").forEach(die => {
            die.addEventListener("click", (event) => {
                if ((event as MouseEvent).shiftKey) {
                    handleKarmaBuySuccess(msg, reroll);
                } else {
                    handleKarmaPoolReroll(msg, reroll);
                }
            });
        });
    }
}

export function registerChatMessageHTMLHook(registrar: HookRegistrar = Hooks): void {
    registrar.on("renderChatMessageHTML", handleChatMessageHTML);
    registerResponderDelegation();
}
