type CreditStickLike = {
    system: { amount: number };
    update?: (data: Record<string, unknown>) => Promise<unknown>;
};

export async function transferBetweenSticks(
    source: CreditStickLike,
    target: CreditStickLike,
    amount: number,
): Promise<{ ok: boolean }> {
    if (amount <= 0 || amount > source.system.amount) return { ok: false };

    await source.update?.({ "system.amount": source.system.amount - amount });
    await target.update?.({ "system.amount": target.system.amount + amount });
    return { ok: true };
}
