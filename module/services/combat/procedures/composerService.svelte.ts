import type { ProcedureSetup } from "./simpleSetups";

export const COMPOSER_KEY = "sr3e:composer";

export type ComposerContext = {
    open: (setup: ProcedureSetup) => void;
};

class ComposerStateImpl {
    isOpen = $state(false);
    selectedPoolKey = $state<string | null>(null);
    poolAvailable = $state(0);
}

export type ComposerState = ComposerStateImpl;

const stateMap = new Map<string, ComposerStateImpl>();

export function getComposerState(actorId: string): ComposerStateImpl {
    if (!stateMap.has(actorId)) stateMap.set(actorId, new ComposerStateImpl());
    return stateMap.get(actorId)!;
}

export function clearComposerState(actorId: string): void {
    stateMap.delete(actorId);
}

// Per-actor open-fn registry — lets service code (defenderFlow, resistanceHandler)
// open the composer on a specific actor's sheet without going through Svelte context.
const registry = new Map<string, (setup: ProcedureSetup) => void>();

// Setups queued before the actor's sheet has mounted — consumed on registerComposerForActor.
const deferredSetups = new Map<string, ProcedureSetup>();

export function registerComposerForActor(actorId: string, openFn: (setup: ProcedureSetup) => void): void {
    registry.set(actorId, openFn);
    const deferred = deferredSetups.get(actorId);
    if (deferred) {
        deferredSetups.delete(actorId);
        openFn(deferred);
    }
}

export function unregisterComposerForActor(actorId: string): void {
    registry.delete(actorId);
}

export function openComposer(setup: ProcedureSetup, actor: unknown): void {
    const id = (actor as any)?.id as string | undefined;
    if (!id) return;
    const openFn = registry.get(id);
    if (openFn) {
        openFn(setup);
    } else {
        deferredSetups.set(id, setup);
    }
}
