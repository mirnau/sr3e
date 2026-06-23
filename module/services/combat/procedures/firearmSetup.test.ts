import { describe, it, expect, vi, beforeEach } from "vitest";
import { buildFirearmSetup } from "./firearmSetup";
import { resetRecoil, bumpOOCShots } from "../recoilTracker";

beforeEach(() => resetRecoil("a1"));

const skill = (id: string, value: number) => ({
    id, type: "skill", system: { value, linkedAttribute: "agility", specializations: [] },
});

const actor = (str = 4) => ({
    id: "a1",
    system: { attributes: { agility: { value: str, total: str } } },
    items: { get: (id: string) => id === "s1" ? skill("s1", 5) : undefined, contents: [skill("s1", 5)] },
    update: vi.fn(),
});

const weapon = (linkedSkillId = "s1", isDefaulting = false) => ({
    system: { linkedSkillId, isDefaulting, difficulty: 4, fireMode: "sa", power: 9, damageType: "m", ammoId: "am1", ranges: {} },
    update: vi.fn(),
});

describe("buildFirearmSetup", () => {
    it("dice from linked skill", () => {
        const s = buildFirearmSetup(actor() as never, weapon());
        expect(s.rollState.dice).toBe(5);
    });
    it("lockPriority advanced", () => {
        expect(buildFirearmSetup(actor() as never, weapon()).lockPriority).toBe("advanced");
    });
    it("selfPublish true", () => {
        expect(buildFirearmSetup(actor() as never, weapon()).selfPublish).toBe(true);
    });
    it("defenseHint reaction", () => {
        expect(buildFirearmSetup(actor() as never, weapon()).defenseHint?.key).toBe("reaction");
    });
    it("recoil mod included after prior shots", () => {
        bumpOOCShots("a1", 1);
        const s = buildFirearmSetup(actor() as never, weapon());
        expect(s.rollState.modifiers.some(m => m.name === "recoil")).toBe(true);
    });
    it("no recoil on first shot", () => {
        const s = buildFirearmSetup(actor() as never, weapon());
        expect(s.rollState.modifiers.some(m => m.name === "recoil")).toBe(false);
    });
    it("exportFn returns ContestExport shape", () => {
        const s = buildFirearmSetup(actor() as never, weapon());
        const exp = s.exportFn();
        expect(exp.next.kind).toBe("dodge");
        expect(exp.familyKey).toBe("firearm");
    });
});
