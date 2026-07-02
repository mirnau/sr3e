type TransactionLike = {
    id?: string;
    name?: string;
    system: {
        amount: number;
        type: string;
        recurrent: boolean;
        isCreditStick: boolean;
        creditorId?: string;
        interestPerMonth?: number;
        paidThroughPeriod?: string;
        lastMissedPeriod?: string;
    };
    update?: (data: Record<string, unknown>) => Promise<unknown>;
};

type ActorLike = {
    createEmbeddedDocuments?: (type: string, data: unknown[]) => Promise<unknown[]>;
};

export function isSubscriptionDue(transaction: TransactionLike, period: string): boolean {
    return transaction.system.type === "expense"
        && transaction.system.recurrent
        && transaction.system.paidThroughPeriod !== period;
}

export function availableCreditSticks(items: TransactionLike[]): TransactionLike[] {
    return items.filter(item => item.system.isCreditStick && item.system.amount > 0);
}

export async function paySubscription(
    transaction: TransactionLike,
    creditStick: TransactionLike,
    period: string,
): Promise<{ ok: boolean }> {
    const cost = transaction.system.amount;
    if (creditStick.system.amount < cost) return { ok: false };

    await creditStick.update?.({ "system.amount": creditStick.system.amount - cost });
    await transaction.update?.({ "system.paidThroughPeriod": period });
    return { ok: true };
}

export async function defaultOnSubscription(
    actor: ActorLike,
    transaction: TransactionLike,
    period: string,
): Promise<void> {
    if (transaction.system.lastMissedPeriod === period) return;

    await actor.createEmbeddedDocuments?.("Item", [{
        name: `${transaction.name ?? "Subscription"} — Defaulted Payment (${period})`,
        type: "transaction",
        system: {
            amount: transaction.system.amount,
            type: "debt",
            recurrent: false,
            isCreditStick: false,
            creditorId: transaction.system.creditorId ?? "",
            interestPerMonth: transaction.system.interestPerMonth ?? 0,
        },
    }]);
    await transaction.update?.({ "system.lastMissedPeriod": period });
}
