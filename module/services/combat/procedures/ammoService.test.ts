import { describe, it, expect, vi } from "vitest";
import { getAttachedAmmo, findCompatibleAmmo, consume, ammoDirectives } from "./ammoService";

const ammoItem = (id: string, rounds: number, ammoClass = "pistol", type = "standard", equipped = true) => ({
    id,
    name: `ammo-${id}`,
    type: "ammunition",
    system: { rounds, maxCapacity: 15, type, ammunitionClass: ammoClass },
    getFlag: (scope: string, key: string) => scope === "sr3e" && key === "isEquipped" ? equipped : undefined,
    update: vi.fn().mockResolvedValue(undefined),
});

const weapon = (ammoId = "a1", ammoClass = "pistol") => ({
    system: { ammoId, ammunitionClass: ammoClass },
    update: vi.fn().mockResolvedValue(undefined),
});

const actor = (items: ReturnType<typeof ammoItem>[]) => ({
    items: {
        get: (id: string) => items.find(i => i.id === id),
        contents: items,
    },
});

describe("getAttachedAmmo", () => {
    it("returns ammo when rounds > 0", () => {
        const a = actor([ammoItem("a1", 5)]);
        expect(getAttachedAmmo(a, weapon())).not.toBeNull();
    });
    it("returns null when rounds = 0", () => {
        const a = actor([ammoItem("a1", 0)]);
        expect(getAttachedAmmo(a, weapon())).toBeNull();
    });
    it("returns null when ammoId empty", () => {
        expect(getAttachedAmmo(actor([]), weapon(""))).toBeNull();
    });
    it("returns null when item missing", () => {
        expect(getAttachedAmmo(actor([]), weapon("missing"))).toBeNull();
    });
});

describe("findCompatibleAmmo", () => {
    it("returns matching equipped ammo with rounds", () => {
        const a = actor([ammoItem("a1", 5, "pistol")]);
        expect(findCompatibleAmmo(a, weapon("", "pistol"))).toHaveLength(1);
    });
    it("excludes wrong class", () => {
        const a = actor([ammoItem("a1", 5, "rifle")]);
        expect(findCompatibleAmmo(a, weapon("", "pistol"))).toHaveLength(0);
    });
    it("excludes unequipped", () => {
        const a = actor([ammoItem("a1", 5, "pistol", "standard", false)]);
        expect(findCompatibleAmmo(a, weapon("", "pistol"))).toHaveLength(0);
    });
    it("excludes empty mags", () => {
        const a = actor([ammoItem("a1", 0, "pistol")]);
        expect(findCompatibleAmmo(a, weapon("", "pistol"))).toHaveLength(0);
    });
});

describe("consume", () => {
    it("decrements rounds", async () => {
        const ammo = ammoItem("a1", 10);
        const w = weapon();
        await consume(actor([ammo]), w, 3);
        expect(ammo.update).toHaveBeenCalledWith({ "system.rounds": 7 });
    });
    it("ejects when rounds hit 0", async () => {
        const ammo = ammoItem("a1", 2);
        const w = weapon();
        await consume(actor([ammo]), w, 2);
        expect(w.update).toHaveBeenCalledWith({ "system.ammoId": "" });
    });
    it("ejects when ammo item missing", async () => {
        const w = weapon("missing");
        await consume(actor([]), w, 1);
        expect(w.update).toHaveBeenCalledWith({ "system.ammoId": "" });
    });
});

describe("ammoDirectives", () => {
    it("APDS halves ballistic armor", () => {
        const d = ammoDirectives(ammoItem("a1", 1, "pistol", "apds") as never);
        expect(d).toContainEqual({ k: "armor.mult.ballistic", v: 0.5 });
    });
    it("gel converts to stun −2", () => {
        const d = ammoDirectives(ammoItem("a1", 1, "pistol", "gel") as never);
        expect(d).toContainEqual({ k: "damage.type", v: "s" });
        expect(d).toContainEqual({ k: "damage.powerAdd", v: -2 });
    });
    it("tracer gives attack TN −1", () => {
        const d = ammoDirectives(ammoItem("a1", 1, "pistol", "tracer") as never);
        expect(d).toContainEqual({ k: "attack.tnAdd", v: -1 });
    });
    it("flechette sets special flag", () => {
        const d = ammoDirectives(ammoItem("a1", 1, "pistol", "flechette") as never);
        expect(d).toContainEqual({ k: "special.flechette", v: 1 });
    });
});
