type FocusItem = {
    type: string;
    system?: { dice?: { spent?: number }; expendable?: boolean };
    update?: (data: Record<string, unknown>) => Promise<unknown>;
};

export type PoolRefreshActor = {
    items?: Iterable<FocusItem>;
    update?: (data: Record<string, unknown>) => Promise<unknown>;
};

// Non-expendable foci recharge their dice the same way a bonded focus's
// pool refreshes each Combat Turn — an expendable (single-use) focus is
// consumed by use instead, so it's deliberately excluded here.
async function refreshFociDice(actor: PoolRefreshActor): Promise<void> {
    for (const item of actor.items ?? []) {
        if (item.type !== "focus" || item.system?.expendable) continue;
        await item.update?.({ "system.dice.spent": 0 });
    }
}

// Shared by the automatic updateCombat-round hook (socketHandlers.ts) and
// the GM's manual "Refresh Pools" button (PoolManager.svelte) — a rigger
// (or anyone else) not added as a combatant to a running encounter never
// gets the automatic reset, since that hook only fires per Combat's own
// combatant list.
export async function resetActorDicePools(actor: PoolRefreshActor): Promise<void> {
    await actor.update?.({
        "system.dicePools.combat.spent": 0,
        "system.dicePools.astral.spent": 0,
        "system.dicePools.hacking.spent": 0,
        "system.dicePools.control.spent": 0,
        "system.dicePools.spell.spent": 0,
    });
    await refreshFociDice(actor);
}
