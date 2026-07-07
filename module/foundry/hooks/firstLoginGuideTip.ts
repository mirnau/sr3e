import { localize } from "../../services/utilities";

const TIP_SEEN_FLAG = "hasSeenGuideTip";

/**
 * Whispers a one-time reminder about the F1 guide to each user the first
 * time they load the world, tracked via a flag on their own User document
 * so it never repeats across sessions.
 */
export async function showFirstLoginGuideTip(): Promise<void> {
    const user = game.user as any;
    if (!user || user.getFlag("sr3e", TIP_SEEN_FLAG)) return;

    await (ChatMessage as any).create({
        whisper: [user.id],
        content: `<p>${localize(CONFIG.SR3E.GUIDE.firstlogintip)}</p>`,
    });

    await user.setFlag("sr3e", TIP_SEEN_FLAG, true);
}
