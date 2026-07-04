import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { registerVehicleControlRigEssenceHook } from "./vehicleControlRigEssence";
import { hooks, typekeys } from "../../types/configuration-keys";

let nextId = 0;

function makeItem(overrides: Partial<{ effects: unknown[]; essenceCost: number; embedded: boolean }> = {}) {
    const id = `item${++nextId}`;
    const embedded = overrides.embedded ?? true;
    return {
        id,
        uuid: `Actor.actor1.Item.${id}`,
        type: typekeys.vehiclecontrolrig,
        img: "icons/svg/mystery-man.svg",
        parent: embedded ? new (globalThis as any).Actor() : null,
        system: { essenceCost: overrides.essenceCost ?? 2 },
        effects: { contents: overrides.effects ?? [] },
        createEmbeddedDocuments: vi.fn().mockResolvedValue(undefined),
    };
}

let capturedHandler: (document: unknown, options: unknown, userId: string) => Promise<void>;

beforeEach(() => {
    (globalThis as Record<string, unknown>).Hooks = {
        on: vi.fn((_event: string, handler: typeof capturedHandler) => { capturedHandler = handler; }),
    };
    (globalThis as Record<string, unknown>).game = { user: { id: "u1" } };
    (globalThis as Record<string, unknown>).localize = (key: string) => key;
    (globalThis as Record<string, unknown>).CONFIG = { SR3E: { VEHICLE_CONTROL_RIG: { vehiclecontrolrig: "sr3e.vehicleControlRig.vehiclecontrolrig" } } };
    (globalThis as Record<string, unknown>).foundry = { utils: { randomID: () => "generated-id" } };
    (globalThis as Record<string, unknown>).Actor = class {};
});

afterEach(() => {
    delete (globalThis as Record<string, unknown>).Hooks;
    delete (globalThis as Record<string, unknown>).game;
    delete (globalThis as Record<string, unknown>).localize;
    delete (globalThis as Record<string, unknown>).CONFIG;
    delete (globalThis as Record<string, unknown>).foundry;
    delete (globalThis as Record<string, unknown>).Actor;
});

describe("registerVehicleControlRigEssenceHook", () => {
    it("registers on createItem", () => {
        registerVehicleControlRigEssenceHook();
        expect((Hooks.on as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith(hooks.createItem, expect.any(Function));
    });

    it("creates one string-typed essence change on a confirmed, initiating-client creation", async () => {
        registerVehicleControlRigEssenceHook();
        const item = makeItem({ essenceCost: 2.5 });

        await capturedHandler(item, { temporary: false }, "u1");

        expect(item.createEmbeddedDocuments).toHaveBeenCalledTimes(1);
        const call = item.createEmbeddedDocuments.mock.calls[0]!;
        const effectData = (call[1] as Record<string, unknown>[])[0] as { _id: string; changes: Record<string, unknown>[]; flags: { sr3e: { target: string } } };
        expect(effectData.changes).toEqual([
            expect.objectContaining({ key: "system.attributes.essence.mod", type: "add", value: "-2.5" }),
        ]);
        // Without this the composer's target dropdown defaults to "self" even
        // though the effect actually transfers to the actor.
        expect(effectData.flags.sr3e.target).toBe("character");
        expect(effectData.changes[0]?.mode).toBeUndefined();
        // A pre-assigned _id is required for Foundry's client-side prediction to
        // reconcile the optimistic and server-confirmed copies of this embedded
        // document into one — without it, both survive and the item ends up
        // with two effects from a single creation call.
        expect(effectData._id).toBeTruthy();
    });

    it("skips a bare item with no parent actor (still sitting in the sidebar)", async () => {
        registerVehicleControlRigEssenceHook();
        const item = makeItem({ embedded: false });

        await capturedHandler(item, { temporary: false }, "u1");

        expect(item.createEmbeddedDocuments).not.toHaveBeenCalled();
    });

    it("skips a temporary (predicted) document", async () => {
        registerVehicleControlRigEssenceHook();
        const item = makeItem();

        await capturedHandler(item, { temporary: true }, "u1");

        expect(item.createEmbeddedDocuments).not.toHaveBeenCalled();
    });

    it("skips when firing for a different client than the initiator", async () => {
        registerVehicleControlRigEssenceHook();
        const item = makeItem();

        await capturedHandler(item, { temporary: false }, "someone-else");

        expect(item.createEmbeddedDocuments).not.toHaveBeenCalled();
    });

    it("does not add a second effect when one already carries the essence flag", async () => {
        registerVehicleControlRigEssenceHook();
        const item = makeItem({ effects: [{ flags: { sr3e: { vehicleControlRigEssence: true } } }] });

        await capturedHandler(item, { temporary: false }, "u1");

        expect(item.createEmbeddedDocuments).not.toHaveBeenCalled();
    });

    it("does not double-fire for the same item within an overlapping async window", async () => {
        registerVehicleControlRigEssenceHook();
        const item = makeItem();

        await Promise.all([
            capturedHandler(item, { temporary: false }, "u1"),
            capturedHandler(item, { temporary: false }, "u1"),
        ]);

        expect(item.createEmbeddedDocuments).toHaveBeenCalledTimes(1);
    });

    it("ignores items of other types", async () => {
        registerVehicleControlRigEssenceHook();
        const item = { ...makeItem(), type: "weapon" };

        await capturedHandler(item, { temporary: false }, "u1");

        expect(item.createEmbeddedDocuments).not.toHaveBeenCalled();
    });
});
