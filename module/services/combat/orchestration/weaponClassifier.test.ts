import { describe, it, expect } from "vitest";
import { classifyWeapon } from "./weaponClassifier";

const weapon = (overrides: Record<string, unknown> = {}) => ({ system: overrides });

describe("classifyWeapon", () => {
    it("semiauto mode → firearm", () => {
        expect(classifyWeapon(weapon({ mode: "semiauto" })).isFirearm).toBe(true);
    });
    it("manual mode → firearm", () => {
        expect(classifyWeapon(weapon({ mode: "manual" })).isFirearm).toBe(true);
    });
    it("energy mode → firearm", () => {
        expect(classifyWeapon(weapon({ mode: "energy" })).isFirearm).toBe(true);
    });
    it("blade mode → melee", () => {
        const r = classifyWeapon(weapon({ mode: "blade" }));
        expect(r.isMelee).toBe(true);
        expect(r.isFirearm).toBe(false);
        expect(r.isExplosive).toBe(false);
    });
    it("blunt mode → melee", () => {
        const r = classifyWeapon(weapon({ mode: "blunt" }));
        expect(r.isMelee).toBe(true);
        expect(r.isFirearm).toBe(false);
    });
    it("explosive mode → isExplosive", () => {
        const r = classifyWeapon(weapon({ mode: "explosive" }));
        expect(r.isExplosive).toBe(true);
        expect(r.isFirearm).toBe(false);
        expect(r.isMelee).toBe(false);
    });
    it("empty mode → not firearm, not melee, not explosive", () => {
        const r = classifyWeapon(weapon({}));
        expect(r.isFirearm).toBe(false);
        expect(r.isMelee).toBe(false);
        expect(r.isExplosive).toBe(false);
    });
    it("manual/semiauto → declaredRounds=1", () => {
        expect(classifyWeapon(weapon({ mode: "semiauto" })).declaredRounds).toBe(1);
        expect(classifyWeapon(weapon({ mode: "manual" })).declaredRounds).toBe(1);
    });
    it("burst → min(3, ammoAvailable)", () => {
        expect(classifyWeapon(weapon({ mode: "burst" }), 2).declaredRounds).toBe(2);
        expect(classifyWeapon(weapon({ mode: "burst" }), 10).declaredRounds).toBe(3);
    });
    it("burst → defaults to 3 when ammo null", () => {
        expect(classifyWeapon(weapon({ mode: "burst" }), null).declaredRounds).toBe(3);
    });
    it("fullauto → clamp(max(3, available), 3, 10)", () => {
        expect(classifyWeapon(weapon({ mode: "fullauto" }), 1).declaredRounds).toBe(3);
        expect(classifyWeapon(weapon({ mode: "fullauto" }), 7).declaredRounds).toBe(7);
        expect(classifyWeapon(weapon({ mode: "fullauto" }), 15).declaredRounds).toBe(10);
    });
});
