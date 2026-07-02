export async function spendProcedurePool(actor: any, poolKey: string | null | undefined, dice: number): Promise<Record<string, unknown>> {
    if (!poolKey || dice <= 0) return {};

    if (poolKey.startsWith("focus:")) {
        const focusId = poolKey.slice("focus:".length);
        const focus = actor.items?.get?.(focusId);
        const spent = Number(focus?.system?.dice?.spent ?? 0);
        await focus?.update?.({ "system.dice.spent": spent + dice }, { render: false });
        return {};
    }

    const pool = actor.system?.dicePools?.[poolKey];
    if (!pool) return {};
    return { [`system.dicePools.${poolKey}.spent`]: (pool.spent ?? 0) + dice };
}

export async function spendProcedureFocus(actor: any, focusKey: string | null | undefined, dice: number): Promise<void> {
    if (!focusKey || dice <= 0) return;
    if (!focusKey.startsWith("focus:")) return;
    const focusId = focusKey.slice("focus:".length);
    const focus = actor.items?.get?.(focusId);
    const spent = Number(focus?.system?.dice?.spent ?? 0);
    await focus?.update?.({ "system.dice.spent": spent + dice }, { render: false });
}
