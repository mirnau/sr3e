import { describe, it, expect, beforeEach } from "vitest";
import { buildDodgeSetup, buildMeleeDefenseSetup } from "./defenseSetups";
import { _resetForTest, waitForResponse } from "../engine/contestCoordinator";

beforeEach(() => _resetForTest());

const defender = (reaction = 4) => ({
    system: { attributes: { reaction: { value: reaction, total: reaction } } },
});

const basis = (dice = 3) => ({
    type: "skill" as const, key: "melee", name: "Melee Combat", dice,
});

describe("buildDodgeSetup", () => {
    it("dice from reaction total", () => {
        expect(buildDodgeSetup(defender(5), "c1").rollState.dice).toBe(5);
    });
    it("TN always 4", () => {
        expect(buildDodgeSetup(defender(), "c1").rollState.targetNumber).toBe(4);
    });
    it("lockPriority simple", () => {
        expect(buildDodgeSetup(defender(), "c1").lockPriority).toBe("simple");
    });
    it("selfPublish false", () => {
        expect(buildDodgeSetup(defender(), "c1").selfPublish).toBe(false);
    });
    it("commitFn delivers response to contest", async () => {
        const promise = waitForResponse("c1");
        const roll = { terms: [], options: { targetNumber: 4 }, meta: { flavor: "", procedureKind: "dodge" } };
        await buildDodgeSetup(defender(), "c1").commitFn(roll, null);
        expect(await promise).toBe(roll);
    });
});

describe("buildMeleeDefenseSetup", () => {
    it("standard mode — no pool restriction", () => {
        const s = buildMeleeDefenseSetup(defender(), basis(), "standard", "c1");
        expect(s.rollState.modifiers.some(m => m.forbidPool)).toBe(false);
    });
    it("full mode — pool forbidden", () => {
        const s = buildMeleeDefenseSetup(defender(), basis(), "full", "c1");
        expect(s.rollState.modifiers.some(m => m.forbidPool)).toBe(true);
    });
    it("lockPriority advanced", () => {
        expect(buildMeleeDefenseSetup(defender(), basis(), "standard", "c1").lockPriority).toBe("advanced");
    });
    it("commitFn delivers response", async () => {
        const promise = waitForResponse("c2");
        const roll = { terms: [], options: { targetNumber: 4 }, meta: { flavor: "", procedureKind: "melee-defense" } };
        await buildMeleeDefenseSetup(defender(), basis(), "standard", "c2").commitFn(roll, null);
        expect(await promise).toBe(roll);
    });
});
