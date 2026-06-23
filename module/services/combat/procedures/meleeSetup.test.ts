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

const weapon = (linkedSkillId = "s1") => ({
    system: { linkedSkillId, isDefaulting: false, difficulty: 4, damage: 2, damageType: "m" },
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
});
