import { currentPeriod, monthsBetween } from "./period";

type TransactionLike = {
    system: {
        amount: number;
        type: string;
        interestPerMonth?: number;
        lastInterestPeriod?: string;
    };
    update?: (data: Record<string, unknown>) => Promise<unknown>;
};

type ActorLike = {
    items: Iterable<TransactionLike>;
};

export function applyPendingInterest(
    transaction: TransactionLike,
    period: string,
): { amount: number; lastInterestPeriod: string } | null {
    const { type, amount, interestPerMonth = 0, lastInterestPeriod = "" } = transaction.system;
    if (type !== "debt" || interestPerMonth <= 0 || lastInterestPeriod === period) return null;

    if (lastInterestPeriod === "") return { amount, lastInterestPeriod: period };

    const elapsed = monthsBetween(lastInterestPeriod, period);
    const grown = amount * (1 + interestPerMonth / 100) ** elapsed;
    return { amount: grown, lastInterestPeriod: period };
}

function currentUserIsGM(): boolean {
    return !!(typeof game !== "undefined" ? (game.user as unknown as { isGM?: boolean } | undefined)?.isGM : false);
}

let lastSeenPeriod = "";

// GM-only: this iterates every actor's debts and writes to them directly, and
// updateWorldTime fires on every connected client. Without gating to a single
// client, players would hit permission errors writing to actors they don't
// own, and a debt owned by both an active player and the GM could have its
// interest compounded twice in the same rollover.
export function registerDebtInterestHook(): void {
    Hooks.on("updateWorldTime", async () => {
        if (!currentUserIsGM()) return;

        const period = currentPeriod(new Date((game as { time: { worldTime: number } }).time.worldTime));
        if (period === lastSeenPeriod) return;
        lastSeenPeriod = period;

        const actors = (game as { actors?: Iterable<ActorLike> }).actors ?? [];
        for (const actor of actors) {
            for (const item of actor.items) {
                const pending = applyPendingInterest(item, period);
                if (pending) await item.update?.({
                    "system.amount": pending.amount,
                    "system.lastInterestPeriod": pending.lastInterestPeriod,
                });
            }
        }
    });
}

export function _resetForTest(): void {
    lastSeenPeriod = "";
}
