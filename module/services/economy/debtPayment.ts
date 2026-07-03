import { requestDebtRepaymentDelivery } from "./debtRepaymentRelay";

type TransactionLike = {
    id?: string;
    name?: string;
    system: { amount: number; creditorId?: string };
    update?: (data: Record<string, unknown>) => Promise<unknown>;
    delete?: () => Promise<unknown>;
};

export async function payDebt(
    debt: TransactionLike,
    creditStick: TransactionLike,
    amount: number,
): Promise<{ paid: number }> {
    const paid = Math.max(0, Math.min(amount, creditStick.system.amount, debt.system.amount));
    if (paid <= 0) return { paid: 0 };

    await creditStick.update?.({ "system.amount": creditStick.system.amount - paid });

    const remaining = debt.system.amount - paid;
    if (remaining <= 0) {
        await debt.delete?.();
    } else {
        await debt.update?.({ "system.amount": remaining });
    }

    if (debt.system.creditorId) {
        await requestDebtRepaymentDelivery(debt.system.creditorId, debt.id ?? "", debt.name ?? "Debt", paid);
    }

    return { paid };
}
