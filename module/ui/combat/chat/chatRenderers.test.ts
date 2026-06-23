import { describe, it, expect } from "vitest";
import { renderRollSummary } from "./renderRollSummary";
import { renderContestOutcome } from "./renderContestOutcome";
import { renderResistancePrompt } from "./renderResistancePrompt";
import { renderResistanceOutcome } from "./renderResistanceOutcome";
import type { RollSnapshot } from "../../../services/combat/engine/types";
import type { ResistancePrep } from "../../../services/combat/engine/types";

function snap(results: number[], tn: number | null = 4, overrides: Record<string, unknown> = {}): RollSnapshot {
    return {
        terms: [{ results: results.map(r => ({ result: r, active: true })) }],
        options: { targetNumber: tn, tnBase: tn ?? undefined, tnMods: [], baseDice: results.length, poolDice: 0, karmaDice: 0, ...overrides },
        meta: { flavor: "Pistols", procedureKind: "firearm" },
    };
}

const actor = { name: "Deckard" };
const target = { name: "Ganger" };

const prep = (tnBase = 4, stage = "m", track = "physical"): ResistancePrep => ({
    familyKey: "firearm", weaponId: null, weaponName: "Predator",
    tnBase, tnMods: [], stagedStepBeforeResist: stage as never, trackKey: track as never,
});

describe("renderRollSummary", () => {
    it("marks successes with sr3e-success class", () => {
        const html = renderRollSummary(actor, snap([5, 3, 6], 4));
        expect(html).toContain('class="sr3e-die sr3e-success"');
        expect(html).toContain('class="sr3e-die"');
    });
    it("shows success count", () => {
        const html = renderRollSummary(actor, snap([5, 6, 2], 4));
        expect(html).toContain("2 successes");
    });
    it("singular success", () => {
        const html = renderRollSummary(actor, snap([5, 2, 1], 4));
        expect(html).toContain("1 success");
        expect(html).not.toContain("1 successes");
    });
    it("open roll omits success count", () => {
        const html = renderRollSummary(actor, snap([5, 9, 3], null));
        expect(html).not.toContain("success");
        expect(html).toContain("open roll");
    });
    it("shows pool breakdown with pool and karma dice", () => {
        const html = renderRollSummary(actor, snap([5], 4, { baseDice: 3, poolDice: 2, karmaDice: 1 }));
        expect(html).toContain("6 dice");
        expect(html).toContain("2 pool");
        expect(html).toContain("1 karma");
    });
    it("shows actor name and flavor", () => {
        const html = renderRollSummary(actor, snap([5], 4));
        expect(html).toContain("Deckard");
        expect(html).toContain("Pistols");
    });
    it("shows TN mods when present", () => {
        const roll = snap([5], 6, { tnBase: 4, tnMods: [{ name: "recoil", value: 2 }], targetNumber: 6 });
        const html = renderRollSummary(actor, roll);
        expect(html).toContain("recoil");
        expect(html).toContain("TN 6");
    });
});

describe("renderContestOutcome", () => {
    it("shows initiator and target names", () => {
        const html = renderContestOutcome({ initiator: actor, target, weaponName: "Predator", initiatorRoll: snap([5, 5], 4), targetRoll: snap([3, 2], 4), netSuccesses: 2 });
        expect(html).toContain("Deckard");
        expect(html).toContain("Ganger");
    });
    it("attacker wins line", () => {
        const html = renderContestOutcome({ initiator: actor, target, weaponName: "Predator", initiatorRoll: snap([5], 4), targetRoll: snap([2], 4), netSuccesses: 1 });
        expect(html).toContain("Deckard wins");
        expect(html).toContain("1 net success");
    });
    it("defender wins line", () => {
        const html = renderContestOutcome({ initiator: actor, target, weaponName: "Predator", initiatorRoll: snap([2], 4), targetRoll: snap([5], 4), netSuccesses: -1 });
        expect(html).toContain("Ganger wins");
    });
    it("tie line", () => {
        const html = renderContestOutcome({ initiator: actor, target, weaponName: "Predator", initiatorRoll: snap([5], 4), targetRoll: snap([5], 4), netSuccesses: 0 });
        expect(html).toContain("Tie");
    });
});

describe("renderResistancePrompt", () => {
    it("contains resist button", () => {
        expect(renderResistancePrompt(prep(), target, "Predator")).toContain("sr3e-resist-damage-button");
    });
    it("shows damage level label", () => {
        expect(renderResistancePrompt(prep(4, "s"), target, "Predator")).toContain("Serious");
    });
    it("shows TN", () => {
        expect(renderResistancePrompt(prep(5), target, "Predator")).toContain("TN 5");
    });
    it("shows weapon name", () => {
        expect(renderResistancePrompt(prep(), target, "AK-97")).toContain("AK-97");
    });
    it("shows TN mod breakdown when present", () => {
        const p = { ...prep(), tnMods: [{ name: "armor-pen", value: -2 }] };
        const html = renderResistancePrompt(p, target, "Predator");
        expect(html).toContain("armor-pen");
    });
});

describe("renderResistanceOutcome", () => {
    const outcome = { applied: true, finalStep: "l" as never, trackKey: "physical" as never, boxes: 1, notes: [] };

    it("shows successes vs TN", () => {
        expect(renderResistanceOutcome(outcome, prep(), 2, 4)).toContain("2 successes vs TN 4");
    });
    it("shows staging arrow", () => {
        expect(renderResistanceOutcome(outcome, prep(4, "m"), 2, 4)).toContain("Moderate → Light");
    });
    it("staged off when applied=false", () => {
        const o = { ...outcome, applied: false, finalStep: null, boxes: 0 };
        expect(renderResistanceOutcome(o, prep(), 4, 4)).toContain("staged off");
    });
    it("shows overflow when non-zero", () => {
        expect(renderResistanceOutcome(outcome, prep(), 0, 4, 2)).toContain("Overflow: 2 boxes");
    });
    it("no overflow line when zero", () => {
        expect(renderResistanceOutcome(outcome, prep(), 0, 4, 0)).not.toContain("Overflow");
    });
});
