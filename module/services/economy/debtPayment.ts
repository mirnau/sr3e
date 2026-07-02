type TransactionLike = {
    system: { amount: number };
    update?: (data: Record<string, unknown>) => Promise<unknown>;
    delete?: () => Promise<unknown>;
};

export async function payDebt(debt: TransactionLike, creditStick: TransactionLike): Promise<{ paid: number }> {
    const paid = Math.min(creditStick.system.amount, debt.system.amount);

    await creditStick.update?.({ "system.amount": creditStick.system.amount - paid });

    const remaining = debt.system.amount - paid;
    if (remaining <= 0) {
        await debt.delete?.();
    } else {
        await debt.update?.({ "system.amount": remaining });
    }

    return { paid };
}
