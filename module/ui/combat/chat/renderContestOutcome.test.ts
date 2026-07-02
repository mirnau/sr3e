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
