import type { ProcedureSetup } from "./simpleSetups";

export const COMPOSER_KEY = "sr3e:composer";

export type ComposerContext = {
    open: (setup: ProcedureSetup) => void;
};

class ComposerStateImpl {
    isOpen = $state(false);
    selectedPoolKey = $state<string | null>(null);
    poolAvailable = $state(0);
    selectedFocusKey = $state<string | null>(null);
    focusAvailable = $state(0);
    focusOptions = $state<{ key: string; label: string; available: number }[]>([]);
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
let fallbackOpenFn: ((setup: ProcedureSetup) => void) | null = null;

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

export function registerComposer(openFn: (setup: ProcedureSetup) => void): void {
    fallbackOpenFn = openFn;
}

export function openComposer(setup: ProcedureSetup, actor: unknown): void {
    const id = (actor as any)?.id as string | undefined;
    if (!id) {
        fallbackOpenFn?.(setup);
        return;
    }
    const openFn = registry.get(id);
    if (openFn) {
        openFn(setup);
    } else if (fallbackOpenFn) {
        fallbackOpenFn(setup);
    } else {
        deferredSetups.set(id, setup);
    }
}
