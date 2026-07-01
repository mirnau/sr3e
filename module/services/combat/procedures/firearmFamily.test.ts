import { describe, it, expect, vi, beforeEach } from "vitest";
import { planFire, beginAttack, onFirearmAttackResolved } from "./firearmFamily";
import { resetRecoil, bumpOOCShots } from "../recoilTracker";

beforeEach(() => resetRecoil("test"));

const weapon = (mode = "semiauto", power = 9, ammoId = "a1") => ({
    system: { mode, power, damageType: "m", ammoId, ranges: {} },
    update: vi.fn().mockResolvedValue(undefined),
});

const actor = (id = "test") => ({
    id,
    system: {},
    items: {
        get: (_id: string) => ({
            id: "a1",
            type: "ammunition",
            system: { rounds: 10, type: "standard", ammunitionClass: "pistol", isEquipped: true },
            update: vi.fn().mockResolvedValue(undefined),
        }),
        contents: [],
    },
    update: vi.fn().mockResolvedValue(undefined),
});

describe("planFire", () => {
    it("no recoil on first semiauto shot", () => {
        const p = planFire("test", weapon(), { declaredRounds: 1 });
        expect(p.attackerTNMod).toBe(0);
    });
    it("recoil on second semiauto shot", () => {
        bumpOOCShots("test", 1);
        const p = planFire("test", weapon(), { declaredRounds: 1 });
        expect(p.attackerTNMod).toBe(1);
    });
    it("caps rounds to ammoAvailable", () => {
        const p = planFire("test", weapon("fullauto"), { declaredRounds: 10, ammoAvailable: 3 });
        expect(p.roundsFired).toBe(3);
    });
});

describe("beginAttack", () => {
    it("returns plan, damage, ammoId", () => {
        const result = beginAttack(actor(), weapon(), { declaredRounds: 1 });
        expect(result.plan.roundsFired).toBe(1);
        expect(result.damage).toHaveProperty("power");
        expect(result.ammoId).toBe("a1");
    });
    it("applies ammo directives when resolver provided", () => {
        const result = beginAttack(actor(), weapon(), {
            declaredRounds: 1,
            resolveAmmo: () => ({
                item: { id: "a1" },
                directives: [{ k: "damage.powerAdd", v: -2 }],
            }),
        });
        expect(result.damage.power).toBe(7); // 9 + (-2)
    });
});

describe("onFirearmAttackResolved", () => {
    it("bumps OOC shots when not in combat", async () => {
        const a = actor();
        const w = weapon();
        const plan = { mode: "semiauto", roundsFired: 3, attackerTNMod: 0, powerDelta: 0, levelDelta: 0, notes: [] };
        await onFirearmAttackResolved(a as never, w as never, plan);
        // recoil tracker bumped — next planFire sees prior shots
        const p = planFire("test", weapon("burst"), { declaredRounds: 3 });
        expect(p.attackerTNMod).toBe(6); // priorShots=3, burst: 3+3=6
    });
});
