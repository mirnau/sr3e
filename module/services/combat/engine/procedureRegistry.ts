import type { ProcedureBuilder } from "./types";

const registry = new Map<string, ProcedureBuilder>();

export function registerProcedure(kind: string, builder: ProcedureBuilder): void {
    if (registry.has(kind)) throw new Error(`Procedure already registered: "${kind}"`);
    registry.set(kind, builder);
}

export function getProcedure(kind: string): ProcedureBuilder {
    const builder = registry.get(kind);
    if (!builder) throw new Error(`No procedure registered for kind: "${kind}"`);
    return builder;
}

export function listKinds(): string[] {
    return [...registry.keys()];
}

export function _resetForTest(): void {
    registry.clear();
}
