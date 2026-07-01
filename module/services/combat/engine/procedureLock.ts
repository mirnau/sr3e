export type LockPriority = "simple" | "advanced";

type LockRecord = {
    id: string;
    ownerKey: string;
    priority: number;
    ts: number;
};

const PRIORITY: Record<LockPriority, number> = { simple: 1, advanced: 10 };

// Keyed by actor ID (the prefix of ownerKey before the first ":").
// Allows different actors to roll simultaneously while still preventing
// a single actor from making overlapping rolls.
const locks = new Map<string, LockRecord>();

function priorityOf(p?: LockPriority): number {
    return PRIORITY[p ?? "simple"];
}

function actorIdOf(ownerKey: string): string {
    const sep = ownerKey.indexOf(":");
    return sep === -1 ? ownerKey : ownerKey.slice(0, sep);
}

export function acquireLock(ownerKey: string, priority?: LockPriority): string | null {
    const p = priorityOf(priority);
    const actorId = actorIdOf(ownerKey);
    const current = locks.get(actorId);
    if (current !== undefined && current.priority >= p) return null;
    const id = `${ownerKey}:${Date.now()}`;
    locks.set(actorId, { id, ownerKey, priority: p, ts: Date.now() });
    return id;
}

export function releaseLock(ownerKeyOrId: string): boolean {
    for (const [actorId, lock] of locks) {
        if (lock.ownerKey === ownerKeyOrId || lock.id === ownerKeyOrId) {
            locks.delete(actorId);
            return true;
        }
    }
    return false;
}

export function assertLock(ownerKey: string, priority?: LockPriority): string | false {
    return acquireLock(ownerKey, priority) ?? false;
}

export function isLocked(): boolean {
    return locks.size > 0;
}

export function currentOwner(): string | null {
    return locks.values().next().value?.ownerKey ?? null;
}

export function _resetForTest(): void {
    locks.clear();
}
