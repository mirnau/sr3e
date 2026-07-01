const pending = new Map<string, string>();

export function registerPendingResponse(actorId: string, contestId: string): void {
    pending.set(actorId, contestId);
}

export function claimPendingResponse(actorId: string): string | null {
    const id = pending.get(actorId) ?? null;
    if (id) pending.delete(actorId);
    return id;
}

export function _resetForTest(): void {
    pending.clear();
}
