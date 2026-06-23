export type LockPriority = "simple" | "advanced";

type LockRecord = {
    id: string;
    ownerKey: string;
    priority: number;
    ts: number;
};

const PRIORITY: Record<LockPriority, number> = { simple: 1, advanced: 10 };

let currentLock: LockRecord | null = null;

function priorityOf(p?: LockPriority): number {
    return PRIORITY[p ?? "simple"];
}

export function acquireLock(ownerKey: string, priority?: LockPriority): string | null {
    const p = priorityOf(priority);
    if (currentLock !== null && currentLock.priority >= p) return null;
    const id = `${ownerKey}:${Date.now()}`;
    currentLock = { id, ownerKey, priority: p, ts: Date.now() };
    return id;
}

export function releaseLock(ownerKeyOrId: string): boolean {
    if (currentLock === null) return false;
    if (currentLock.ownerKey === ownerKeyOrId || currentLock.id === ownerKeyOrId) {
        currentLock = null;
        return true;
    }
    return false;
}

export function assertLock(ownerKey: string, priority?: LockPriority): string | false {
    return acquireLock(ownerKey, priority) ?? false;
}

export function isLocked(): boolean {
    return currentLock !== null;
}

export function currentOwner(): string | null {
    return currentLock?.ownerKey ?? null;
}

export function _resetForTest(): void {
    currentLock = null;
}
