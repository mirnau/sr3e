import { describe, expect, it, vi, afterEach } from "vitest";
import { get } from "svelte/store";
import { StoreManager } from "./StoreManager.svelte";

type HookCallback = (...args: unknown[]) => void;

function mockHooks() {
    const listeners = new Map<string, Map<number, HookCallback>>();
    let nextId = 1;

    const Hooks = {
        on(event: string, cb: HookCallback): number {
            const id = nextId++;
            if (!listeners.has(event)) listeners.set(event, new Map());
            listeners.get(event)!.set(id, cb);
            return id;
        },
        off(event: string, id: number): void {
            listeners.get(event)?.delete(id);
        },
        callAll(event: string, ...args: unknown[]): void {
            listeners.get(event)?.forEach(cb => cb(...args));
        },
    };
    (globalThis as Record<string, unknown>).Hooks = Hooks;
    return Hooks;
}

function actorDocument(uuid: string, id: string) {
    return {
        uuid,
        id,
        documentName: "Actor",
        system: { attributes: { essence: { value: 6, mod: 0 } }, health: { stun: { value: 0 } } },
        update: vi.fn().mockResolvedValue(undefined),
    };
}

function getProperty(obj: unknown, path: string): unknown {
    return path.split(".").reduce<unknown>((acc, key) => (acc as Record<string, unknown> | undefined)?.[key], obj);
}

(globalThis as Record<string, unknown>).foundry = { utils: { getProperty } };

afterEach(() => {
    delete (globalThis as Record<string, unknown>).Hooks;
});

describe("StoreManager — hook matching survives token-scoped UUIDs", () => {
    // Reproduces the live bug: a sheet opened via a token on the canvas gets
    // an actor reference whose .uuid is scene/token-scoped
    // (Scene.X.Token.Y.Actor.Z), captured by Subscribe(). Foundry's
    // updateActor hook fires with the canonical (non-token-scoped) actor
    // reference — a differently-uuid'd view over the SAME underlying data
    // (both share the same .system object; Foundry mutates it in place).
    // Matching by .uuid silently never matches in that case, even though the
    // document is functionally identical — the fix is to match by .id.
    it("updates an RW store when updateActor fires with a differently-formatted .uuid for the same underlying document", () => {
        const Hooks = mockHooks();
        const tokenScopedActor = actorDocument("Scene.s1.Token.t1.Actor.a1", "a1");
        const storeManager = StoreManager.Instance;
        storeManager.Subscribe(tokenScopedActor);

        const stunStore = storeManager.GetRWStore<number>(tokenScopedActor, "health.stun.value");
        expect(get(stunStore)).toBe(0);

        // Canonical view Foundry passes to the hook — same .id and same
        // shared .system reference (mutated in place), different .uuid.
        const canonicalActor = { ...actorDocument("Actor.a1", "a1"), system: tokenScopedActor.system };
        canonicalActor.system.health.stun.value = 6;
        Hooks.callAll("updateActor", canonicalActor, { system: { health: { stun: { value: 6 } } } });

        expect(get(stunStore)).toBe(6);

        storeManager.Unsubscribe(tokenScopedActor);
    });

    // Reproduces the second bug found in live testing: even after matching by
    // .id, the SAME actor can be represented by genuinely separate document
    // instances (a token-scoped view the sheet subscribed with, vs. the
    // instance a game.actors.get(id).update() write actually mutates).
    // Reading values off the stale subscribed reference showed pre-update
    // data even though the write had already landed correctly in the
    // database and the hook fired with the correct fresh data right there in
    // its own parameter — the fix reads values from the hook's own document,
    // not the one captured at Subscribe() time.
    it("reads the updated value from the hook's own document, not the stale subscribed reference", () => {
        const Hooks = mockHooks();
        const tokenScopedActor = actorDocument("Scene.s1.Token.t1.Actor.a1", "a1");
        const storeManager = StoreManager.Instance;
        storeManager.Subscribe(tokenScopedActor);

        const stunStore = storeManager.GetRWStore<number>(tokenScopedActor, "health.stun.value");
        expect(get(stunStore)).toBe(0);

        // A genuinely separate object instance — its own .system, not shared
        // with tokenScopedActor — matching what live testing showed: the
        // subscribed reference's own data never changes even though this
        // fresh one (and the database) are already correct.
        const freshActor = actorDocument("Actor.a1", "a1");
        freshActor.system.health.stun.value = 6;
        Hooks.callAll("updateActor", freshActor, { system: { health: { stun: { value: 6 } } } });

        expect(get(stunStore)).toBe(6);

        storeManager.Unsubscribe(tokenScopedActor);
    });

    it("does not update the store for an unrelated actor's update", () => {
        const Hooks = mockHooks();
        const subject = actorDocument("Scene.s1.Token.t1.Actor.a1", "a1");
        const storeManager = StoreManager.Instance;
        storeManager.Subscribe(subject);

        const stunStore = storeManager.GetRWStore<number>(subject, "health.stun.value");

        const otherActor = actorDocument("Actor.a2", "a2");
        otherActor.system.health.stun.value = 9;
        Hooks.callAll("updateActor", otherActor, {});

        expect(get(stunStore)).toBe(0);

        storeManager.Unsubscribe(subject);
    });

    it("refreshes SimpleStat totals when an ActiveEffect changes on the actor", () => {
        const Hooks = mockHooks();
        const actor = actorDocument("Actor.a1", "a1");
        const storeManager = StoreManager.Instance;
        storeManager.Subscribe(actor);

        const essence = storeManager.GetSimpleStatROStore(actor, "attributes.essence");
        expect(get(essence)).toBe(6);

        actor.system.attributes.essence.mod = -2;
        Hooks.callAll("createActiveEffect", { parent: actor });

        expect(get(essence)).toBe(4);
        expect(actor.update).not.toHaveBeenCalled();

        storeManager.Unsubscribe(actor);
    });
});
