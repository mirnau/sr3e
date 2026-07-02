import { describe, expect, it } from "vitest";
import { renderContestOutcome } from "./renderContestOutcome";
import type { RollSnapshot } from "../../../services/combat/engine/types";

function roll(results: number[], tn: number): RollSnapshot {
    return {
        terms: [{ results: results.map(r => ({ active: true, result: r })) }],
        options: { targetNumber: tn },
        meta: { flavor: "Attack", procedureKind: "firearm" },
    };
}

describe("renderContestOutcome", () => {
    it("wraps each side's dice in a data-side container so clicks can be attributed", () => {
        const html = renderContestOutcome({
            initiator: { name: "Attacker" },
            target: { name: "Defender" },
            weaponName: "Predator",
            initiatorRoll: roll([6, 5], 4),
            targetRoll: roll([3, 2], 4),
            netSuccesses: 2,
        });

        expect(html).toContain('data-side="initiator"');
        expect(html).toContain('data-side="target"');
        expect(html).toContain("Attacker");
        expect(html).toContain("Defender");
    });

    it("renders a bought die as a coin icon, not its raw TN value, when explicit results are passed", () => {
        const html = renderContestOutcome({
            initiator: { name: "Attacker" },
            target: { name: "Defender" },
            weaponName: "Predator",
            initiatorRoll: roll([6, 4], 4),
            targetRoll: roll([2], 4),
            initiatorResults: [{ result: 6 }, { result: 4, bought: true }],
            netSuccesses: 2,
        });

        expect(html).toContain("sr3e-bought");
        expect(html).toContain("fa-coins");
    });
});

describe("renderContestOutcome — winnerLine", () => {
    const ctx = (netSuccesses: number) => ({
        initiator: { name: "Attacker" },
        target: { name: "Defender" },
        weaponName: "Predator",
        initiatorRoll: roll([6], 4),
        targetRoll: roll([6], 4),
        netSuccesses,
    });

    it("reports the initiator as winner on a positive margin", () => {
        const html = renderContestOutcome(ctx(2));
        expect(html).toContain("Attacker wins — 2 net successes");
        expect(html).not.toContain("Tie");
    });

    // This is the actual bug: computeNetSuccesses clamps at zero, so a
    // defender win was previously indistinguishable from a tie. netSuccesses
    // must be signed (computeSignedNetSuccesses) for this branch to ever
    // fire correctly.
    it("reports the target/defender as winner on a negative margin, not a tie", () => {
        const html = renderContestOutcome(ctx(-3));
        expect(html).toContain("Defender wins — 3 net successes");
        expect(html).not.toContain("Tie");
    });

    it("singular 'success' wording for a margin of exactly 1, either direction", () => {
        expect(renderContestOutcome(ctx(1))).toContain("Attacker wins — 1 net success<");
        expect(renderContestOutcome(ctx(-1))).toContain("Defender wins — 1 net success<");
    });

    it("reports a tie only on an exact zero margin", () => {
        const html = renderContestOutcome(ctx(0));
        expect(html).toContain("Tie — defender wins ties");
    });
});
