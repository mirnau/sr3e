// ChatMessage has no configurable per-document ownership — only its author or
// a GM may update it. Any client that isn't the author routes its write
// through the GM's client via socket instead of calling message.update() directly.

import { serializeByKey } from "../../writeQueue";

function currentUserIsGM(): boolean {
    return !!(typeof game !== "undefined" ? (game.user as unknown as { isGM?: boolean } | undefined)?.isGM : false);
}

type MessageDoc = {
    flags?: { sr3e?: Record<string, unknown> };
    update?: (data: Record<string, unknown>) => Promise<unknown>;
};

function getMessage(messageId: string): MessageDoc | undefined {
    return (game.messages as unknown as { get: (id: string) => MessageDoc | undefined }).get(messageId);
}

export function readMessageFlag<T>(messageId: string, key: string): T | undefined {
    return getMessage(messageId)?.flags?.sr3e?.[key] as T | undefined;
}

export async function updateMessageAsGM(messageId: string, data: Record<string, unknown>): Promise<void> {
    if (!currentUserIsGM()) return;
    await serializeByKey(`message:${messageId}`, async () => {
        await getMessage(messageId)?.update?.(data);
    });
}

// Reads the message's current flag under `key`, merges in whatever `merge`
// computes from it, and writes the result — all inside the same serialized
// write slot, so the merge always sees the latest state rather than a
// client-side snapshot taken at click time.
export async function mergeMessageFlagAsGM<T>(
    messageId: string,
    key: string,
    merge: (current: T | undefined) => { data: Record<string, unknown> },
): Promise<void> {
    if (!currentUserIsGM()) return;
    await serializeByKey(`message:${messageId}`, async () => {
        const current = getMessage(messageId)?.flags?.sr3e?.[key] as T | undefined;
        const { data } = merge(current);
        await getMessage(messageId)?.update?.(data);
    });
}

export async function requestMessageUpdate(messageId: string, data: Record<string, unknown>): Promise<void> {
    if (typeof game === "undefined") return;

    if (currentUserIsGM()) {
        await updateMessageAsGM(messageId, data);
        return;
    }

    (game.socket as unknown as { emit: (event: string, data: unknown) => void } | undefined)
        ?.emit("system.sr3e", { type: "updateChatMessage", messageId, data });
}
