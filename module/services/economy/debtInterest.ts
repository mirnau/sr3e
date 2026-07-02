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

let lastSeenPeriod = "";

export function registerDebtInterestHook(): void {
    Hooks.on("updateWorldTime", async () => {
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
