import { describe, it, expect } from "vitest";
import { buildMeleeSetup } from "./meleeSetup";

const skill = (id: string, value: number) => ({
    id, type: "skill", system: { skillType: "active", activeSkill: { value, linkedAttribute: "quickness", specializations: [] } },
});

const actor = (str = 4) => ({
    id: "a1",
    system: { attributes: { strength: { value: str, total: str }, quickness: { value: 4, total: 4 } } },
    items: { get: (id: string) => id === "s1" ? skill("s1", 4) : undefined, contents: [skill("s1", 4)] },
});

const weapon = (linkedSkillId = "s1", isDefaulting = false) => ({
    system: { linkedSkillId, isDefaulting, difficulty: 4, damage: 2, damageType: "m" },
});

describe("buildMeleeSetup", () => {
    it("dice from linked skill", () => {
        expect(buildMeleeSetup(actor() as never, weapon()).rollState.dice).toBe(4);
    });
    it("TN from weapon difficulty", () => {
        expect(buildMeleeSetup(actor() as never, weapon()).rollState.targetNumber).toBe(4);
    });
    it("lockPriority advanced", () => {
        expect(buildMeleeSetup(actor() as never, weapon()).lockPriority).toBe("advanced");
    });
    it("defenseHint key is melee", () => {
        expect(buildMeleeSetup(actor() as never, weapon()).defenseHint?.key).toBe("melee");
    });
    it("commitFn no-op", async () => {
        await expect(buildMeleeSetup(actor() as never, weapon()).commitFn(null, null)).resolves.toBeUndefined();
    });
    it("exportFn next.kind is melee-defense", () => {
        const s = buildMeleeSetup(actor() as never, weapon());
        expect(s.exportFn().next.kind).toBe("melee-defense");
    });
    it("exportFn next.ui has standard and full keys", () => {
        const ui = buildMeleeSetup(actor() as never, weapon()).exportFn().next.ui;
        expect(ui).toHaveProperty("standard");
        expect(ui).toHaveProperty("full");
    });
    it("exposes the linked skill's attribute for composer-driven defaulting", () => {
        expect(buildMeleeSetup(actor() as never, weapon()).defaultingAttributeKey).toBe("quickness");
    });
    it("excludes the linked skill from the defaulting picker when the weapon is not itself defaulting", () => {
        const s = buildMeleeSetup(actor() as never, weapon("s1", false));
        expect(s.defaultingExcludeSkillId).toBe("s1");
        expect(s.itemDefaultsOnRoll).toBe(false);
        expect(s.defaultingPreselectedSkillId).toBeNull();
    });
    it("pre-selects the linked skill instead of excluding it when the weapon itself defaults on roll", () => {
        const s = buildMeleeSetup(actor() as never, weapon("s1", true));
        expect(s.defaultingExcludeSkillId).toBeNull();
        expect(s.itemDefaultsOnRoll).toBe(true);
        expect(s.defaultingPreselectedSkillId).toBe("s1");
    });
});
