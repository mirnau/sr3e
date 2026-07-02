import { describe, it, expect, vi, afterEach } from "vitest";
import { executeResistanceRoll, promptResistance } from "./resistanceFlow";
import type { ResistancePrep } from "../engine/types";
import type { ResistanceOutcomeFlag } from "./resistanceRerollHandler";

const prep = (tnBase = 4): ResistancePrep => ({
    familyKey: "firearm", weaponId: null, weaponName: "Predator",
    tnBase, tnMods: [], stagedStepBeforeResist: "m", trackKey: "physical", boxesIfUnresisted: 4,
});

const defender = (body = 4, physValue = 0, stunValue = 0, overflow = 0) => ({
    id: "def1",
    name: "Defender",
    system: {
        attributes: { body: { value: body, total: body } },
        health: { physical: { value: physValue }, stun: { value: stunValue }, overflow: { value: overflow } },
    },
    items: { contents: [] },
    update: vi.fn().mockResolvedValue(undefined),
});

function rollSnapshot(results: number[], targetNumber = 4) {
    return {
        terms: [{ results: results.map(r => ({ result: r, active: true })) }],
        options: { targetNumber },
        meta: { flavor: "", procedureKind: "resistance" },
    };
}

describe("executeResistanceRoll", () => {
    afterEach(() => { delete (globalThis as Record<string, unknown>).ChatMessage; });

    // Damage is deliberately NOT applied by this function anymore — it posts
    // an interactive message and defers to handleResistanceDone (see
    // resistanceRerollHandler.test.ts) so the defender can reroll/buy first.
    it("posts an interactive message without touching the defender's health", async () => {
        const create = vi.fn().mockResolvedValue(undefined);
        (globalThis as Record<string, unknown>).ChatMessage = { create };
        const d = defender(4, 0);

        await executeResistanceRoll(prep(6), d, rollSnapshot([1, 2, 3, 4]));

        expect(d.update).not.toHaveBeenCalled();
        expect(create).toHaveBeenCalledOnce();
        const flag = (create.mock.calls[0]?.[0] as Record<string, unknown>).flags as { sr3e: { resistanceOutcome: ResistanceOutcomeFlag } };
        expect(flag.sr3e.resistanceOutcome.actorId).toBe("def1");
        expect(flag.sr3e.resistanceOutcome.results).toHaveLength(4);
        expect(flag.sr3e.resistanceOutcome.baseline).toEqual({ stun: 0, physical: 0, overflow: 0 });
    });
});

describe("promptResistance", () => {
    afterEach(() => { delete (globalThis as Record<string, unknown>).game; delete (globalThis as Record<string, unknown>).ChatMessage; });

    it("whispers the controlling player", async () => {
        const create = vi.fn().mockResolvedValue(undefined);
        (globalThis as Record<string, unknown>).game = {
            socket: { emit: vi.fn() },
            users: new Map([
                ["gm1", { id: "gm1", isGM: true, active: true }],
                ["player1", { id: "player1", isGM: false, active: true }],
            ]),
        };
        (globalThis as Record<string, unknown>).ChatMessage = { create };

        const d = { ...defender(4, 0), id: "def1", name: "Defender", ownership: { player1: 3 } };
        await promptResistance(prep(6), d as never);

        const [call] = create.mock.calls;
        expect((call[0] as Record<string, unknown>).whisper).toEqual(["player1"]);
    });
});
