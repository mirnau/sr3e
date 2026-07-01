import { describe, it, expect, beforeEach } from "vitest";
import { buildDodgeSetup, buildMeleeDefenseSetup } from "./defenseSetups";
import { _resetForTest, waitForResponse, startContest } from "../engine/contestCoordinator";
import type { ContestExport } from "../engine/types";

beforeEach(() => _resetForTest());

const defender = () => ({
    system: { attributes: {} },
});

const exportCtx = (roundsFired = 1): ContestExport => ({
    familyKey: "firearm",
    weaponId: null,
    weaponName: "Predator",
    plan: { roundsFired, attackerTNMod: 0, powerDelta: 0, levelDelta: 0, notes: [] },
    damage: null,
    tnBase: 4,
    tnMods: [],
    next: { kind: "dodge", ui: {}, args: {} },
});

function makeContest(rounds = 1): string {
    const initiatorRoll = { terms: [], options: { targetNumber: 4 }, meta: { flavor: "", procedureKind: "firearm" } };
    const fakeActor: any = { id: "att1", system: {} };
    const fakeTarget: any = { id: "def1", name: "Defender", system: {}, items: { contents: [] } };
    (globalThis as any).game = { actors: { get: () => fakeTarget }, users: { values: () => [][Symbol.iterator]() }, user: { id: "u1" }, socket: null };
    const { contestId } = startContest(
        { schema: 2, kind: "firearm", actor: { id: "att1", uuid: "" }, item: { id: null, uuid: null }, rollState: { dice: 0, poolDice: 0, karmaDice: 0, targetNumber: 4, modifiers: [] }, exportCtx: exportCtx(rounds) },
        exportCtx(rounds),
        { type: "attribute", key: "reaction", tnMod: 0, tnLabel: "Reaction" },
        fakeTarget,
        null,
        initiatorRoll,
    );
    return contestId;
}

const basis = (dice = 3) => ({
    type: "skill" as const, key: "melee", name: "Melee Combat", dice,
});

describe("buildDodgeSetup", () => {
    it("dice is 0 — combat pool only", () => {
        const contestId = makeContest(1);
        expect(buildDodgeSetup(defender(), contestId).rollState.dice).toBe(0);
    });

    it("TN is 4 for single shot", () => {
        const contestId = makeContest(1);
        expect(buildDodgeSetup(defender(), contestId).rollState.targetNumber).toBe(4);
    });

    it("TN +1 for 3-round burst", () => {
        const contestId = makeContest(3);
        expect(buildDodgeSetup(defender(), contestId).rollState.targetNumber).toBe(5);
    });

    it("TN +2 for 6-round burst", () => {
        const contestId = makeContest(6);
        expect(buildDodgeSetup(defender(), contestId).rollState.targetNumber).toBe(6);
    });

    it("initialPoolKey is combat", () => {
        const contestId = makeContest(1);
        expect(buildDodgeSetup(defender(), contestId).initialPoolKey).toBe("combat");
    });

    it("lockPriority simple", () => {
        const contestId = makeContest(1);
        expect(buildDodgeSetup(defender(), contestId).lockPriority).toBe("simple");
    });

    it("selfPublish false", () => {
        const contestId = makeContest(1);
        expect(buildDodgeSetup(defender(), contestId).selfPublish).toBe(false);
    });

    it("commitFn delivers response to contest", async () => {
        const contestId = makeContest(1);
        const promise = waitForResponse(contestId);
        const roll = { terms: [], options: { targetNumber: 4 }, meta: { flavor: "", procedureKind: "dodge" } };
        await buildDodgeSetup(defender(), contestId).commitFn(roll, null);
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
