import { handleDefenderChoice } from "../../services/combat/orchestration/defenderFlow";
import {
    handleResistanceClick,
    type ResistanceCtx,
} from "../../services/combat/orchestration/resistanceHandler";

type ChatMessageLike = {
    flags?: {
        sr3e?: Record<string, unknown>;
    };
};

type HookRegistrar = {
    on(event: string, callback: (message: ChatMessageLike, html: HTMLElement) => void): unknown;
};

export function handleChatMessageHTML(message: ChatMessageLike, html: HTMLElement): void {
    const sr3eFlags = message.flags?.sr3e;
    if (!sr3eFlags) return;

    const contestId = sr3eFlags.opposed as string | undefined;
    if (contestId) {
        html.querySelectorAll<HTMLElement>("[data-responder]").forEach(button => {
            button.addEventListener("click", event => {
                const key = (event.currentTarget as HTMLElement).dataset.responder ?? null;
                handleDefenderChoice(contestId, key);
            });
        });
    }

    const resistance = sr3eFlags.damageResistance as ResistanceCtx | undefined;
    if (resistance) {
        html.querySelector(".sr3e-resist-damage-button")?.addEventListener("click", () => {
            handleResistanceClick(resistance);
        });
    }
}

export function registerChatMessageHTMLHook(registrar: HookRegistrar = Hooks): void {
    registrar.on("renderChatMessageHTML", handleChatMessageHTML);
}
