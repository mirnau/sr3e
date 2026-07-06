import type { ProcedureSetup } from "./simpleSetups";
import type { Modifier } from "../engine/types";

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
    poolAvailableOverrides = $state<Record<string, number> | null>(null);
    // Toggled on/off from outside the composer (e.g. Matrix Program cards in
    // Matrix.svelte) while it's open — merged into RollComposerComponent's
    // TN Modifiers list, since there's no ActiveEffect/gadget path that can
    // reach a TN modifier for these.
    programModifiers = $state<Modifier[]>([]);
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

export function toggleComposerProgramModifier(actorId: string, modifier: Modifier): void {
    const state = getComposerState(actorId);
    const exists = state.programModifiers.some(m => m.id === modifier.id);
    state.programModifiers = exists
        ? state.programModifiers.filter(m => m.id !== modifier.id)
        : [...state.programModifiers, modifier];
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

// Identity-guarded: two composer instances can coexist for one actorId
// (unlinked token sheet + sidebar sheet share the actor id, and close/reopen
// can overlap mount/destroy). A destroyed instance may only remove the entry
// if it is still the registered one — otherwise it would clobber the live
// instance's registration and every subsequent openComposer call for that
// actor would silently land in deferredSetups. Returns whether this instance
// owned the registration, so the caller knows if shared state is now orphaned.
export function unregisterComposerForActor(actorId: string, openFn: (setup: ProcedureSetup) => void): boolean {
    if (registry.get(actorId) !== openFn) return false;
    registry.delete(actorId);
    return true;
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
        // Legitimate for a not-yet-mounted sheet (defender flow), but must
        // never be invisible — a swallowed setup here is a dead Roll click.
        console.warn(`sr3e | No composer registered for actor ${id} — deferring setup until its sheet mounts.`);
        deferredSetups.set(id, setup);
    }
}
