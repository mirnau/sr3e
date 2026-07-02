import { describe, it, expect, beforeAll } from "vitest";
import { buildRollSnapshot } from "./rollSnapshot";
import { SR3ERoll } from "./SR3ERoll";
import type { RollState } from "../diceFormula";
import type { ProcedureSetup } from "../procedures/simpleSetups";

class MockRoll {
    terms = [{ results: [{ result: 5, active: true }] }];
    async evaluate() { return this; }
}
(globalThis as Record<string, unknown>).Roll = MockRoll;

let roll: SR3ERoll;
beforeAll(async () => { roll = await SR3ERoll.build(1, 4).evaluate(); });

const state = (overrides: Partial<RollState> = {}): RollState => ({
    dice: 4, poolDice: 2, karmaDice: 0, targetNumber: 5, modifiers: [], ...overrides,
});

const setup = (kind = "firearm", title = "Firearm Attack"): ProcedureSetup => ({
    kind, title, rollState: state(), lockPriority: "advanced", selfPublish: true,
    defenseHint: null, exportFn: () => ({} as never), commitFn: async () => {},
});

describe("buildRollSnapshot", () => {
    it("targetNumber uses computeFinalTN with floor=2", () => {
        expect(buildRollSnapshot(roll, setup(), state({ targetNumber: 5 })).options.targetNumber).toBe(5);
    });
    it("floor at 2 when mods drive TN below 2", () => {
        const s = state({ targetNumber: 1, modifiers: [{ name: "neg", value: -2 }] });
        expect(buildRollSnapshot(roll, setup(), s).options.targetNumber).toBe(2);
    });
    it("meta.procedureKind matches setup.kind", () => {
        expect(buildRollSnapshot(roll, setup("skill"), state()).meta.procedureKind).toBe("skill");
    });
    it("meta.flavor matches setup.title", () => {
        expect(buildRollSnapshot(roll, setup("skill", "My Roll"), state()).meta.flavor).toBe("My Roll");
    });
    it("type: skill for skill kind", () => {
        expect(buildRollSnapshot(roll, setup("skill"), state()).options.type).toBe("skill");
    });
    it("type: attribute for attribute kind", () => {
        expect(buildRollSnapshot(roll, setup("attribute"), state()).options.type).toBe("attribute");
    });
    it("type: item for firearm kind", () => {
        expect(buildRollSnapshot(roll, setup("firearm"), state()).options.type).toBe("item");
    });
    it("dice breakdown present", () => {
        const snap = buildRollSnapshot(roll, setup(), state({ dice: 3, poolDice: 1, focusDice: 2, focusKey: "focus:f1", focusLabel: "Power Focus", karmaDice: 0 }));
        expect(snap.options.baseDice).toBe(3);
        expect(snap.options.poolDice).toBe(1);
        expect(snap.options.focusDice).toBe(2);
        expect(snap.options.focusKey).toBe("focus:f1");
        expect(snap.options.focusLabel).toBe("Power Focus");
        expect(snap.options.karmaDice).toBe(0);
    });
    it("includes procedure extra options", () => {
        const snap = buildRollSnapshot(roll, { ...setup(), extraOptions: { spell: { name: "Manabolt" } } }, state());
        expect(snap.options.spell).toEqual({ name: "Manabolt" });
    });
    it("keeps selected spell force in extra options", () => {
        const snap = buildRollSnapshot(roll, { ...setup(), extraOptions: { spell: { name: "Levitate", force: 3, learnedForce: 5 } } }, state());
        expect(snap.options.spell).toEqual({ name: "Levitate", force: 3, learnedForce: 5 });
    });
});
