import { describe, it, expect } from "vitest";
import { classifyWeapon } from "./weaponClassifier";

const weapon = (overrides: Record<string, unknown> = {}) => ({ system: overrides });

describe("classifyWeapon", () => {
    it("ammoId present → firearm", () => {
        expect(classifyWeapon(weapon({ ammoId: "a1" })).isFirearm).toBe(true);
    });
    it("fireMode present → firearm", () => {
        expect(classifyWeapon(weapon({ fireMode: "sa" })).isFirearm).toBe(true);
    });
    it("no firearm signals → melee", () => {
        const r = classifyWeapon(weapon({ damage: 2 }));
        expect(r.isMelee).toBe(true);
        expect(r.isFirearm).toBe(false);
    });
    it("SS/SA → declaredRounds=1", () => {
        expect(classifyWeapon(weapon({ ammoId: "a1", fireMode: "sa" })).declaredRounds).toBe(1);
    });
    it("BF → min(3, ammoAvailable)", () => {
        expect(classifyWeapon(weapon({ ammoId: "a1", fireMode: "bf" }), 2).declaredRounds).toBe(2);
        expect(classifyWeapon(weapon({ ammoId: "a1", fireMode: "bf" }), 10).declaredRounds).toBe(3);
    });
    it("BF → defaults to 3 when ammo null", () => {
        expect(classifyWeapon(weapon({ ammoId: "a1", fireMode: "bf" }), null).declaredRounds).toBe(3);
    });
    it("FA → clamp(max(3, available), 3, 10)", () => {
        expect(classifyWeapon(weapon({ ammoId: "a1", fireMode: "fa" }), 1).declaredRounds).toBe(3);
        expect(classifyWeapon(weapon({ ammoId: "a1", fireMode: "fa" }), 7).declaredRounds).toBe(7);
        expect(classifyWeapon(weapon({ ammoId: "a1", fireMode: "fa" }), 15).declaredRounds).toBe(10);
    });
});
