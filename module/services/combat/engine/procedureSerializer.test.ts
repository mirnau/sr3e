import { describe, it, expect } from "vitest";
import { serializeProcedure, deserializeProcedure } from "./procedureSerializer";
import type { RollState, ContestExport } from "./types";

const mockActor = { id: "a1", uuid: "Actor.a1" } as unknown as import("../../../documents/SR3EActor").default;
const mockItem = { id: "i1", uuid: "Item.i1" } as unknown as import("../../../documents/SR3EItem").default;

const rollState: RollState = { dice: 4, poolDice: 2, karmaDice: 0, targetNumber: 5, modifiers: [] };

const exportCtx: ContestExport = {
    familyKey: "firearm",
    weaponId: "i1",
    weaponName: "Predator",
    plan: null,
    damage: null,
    tnBase: 5,
    tnMods: [],
    next: { kind: "dodge", ui: {}, args: {} },
};

describe("serializeProcedure", () => {
    it("schema is 2", () => {
        const s = serializeProcedure("firearm", mockActor, mockItem, rollState, exportCtx);
        expect(s.schema).toBe(2);
    });
    it("captures kind, actor, item refs", () => {
        const s = serializeProcedure("firearm", mockActor, mockItem, rollState, exportCtx);
        expect(s.kind).toBe("firearm");
        expect(s.actor).toEqual({ id: "a1", uuid: "Actor.a1" });
        expect(s.item).toEqual({ id: "i1", uuid: "Item.i1" });
    });
    it("null item → null refs", () => {
        const s = serializeProcedure("skill", mockActor, null, rollState, exportCtx);
        expect(s.item).toEqual({ id: null, uuid: null });
    });
});

describe("deserializeProcedure", () => {
    it("round-trips via injectable resolvers", async () => {
        const s = serializeProcedure("firearm", mockActor, mockItem, rollState, exportCtx);
        const d = await deserializeProcedure(s, {
            resolveActor: async () => mockActor,
            resolveItem: async () => mockItem,
        });
        expect(d.kind).toBe("firearm");
        expect(d.actor).toBe(mockActor);
        expect(d.item).toBe(mockItem);
        expect(d.rollState).toEqual(rollState);
        expect(d.exportCtx).toEqual(exportCtx);
    });

    it("null item resolves to null", async () => {
        const s = serializeProcedure("skill", mockActor, null, rollState, exportCtx);
        const d = await deserializeProcedure(s, {
            resolveActor: async () => mockActor,
            resolveItem: async () => null,
        });
        expect(d.item).toBeNull();
    });
});
