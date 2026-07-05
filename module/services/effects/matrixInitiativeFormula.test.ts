import { describe, expect, it } from "vitest";
import { findJackedInCyberdeck, matrixInitiativeFormula, resolveInitiativeFormula, standardInitiativeFormula } from "./matrixInitiativeFormula";

describe("matrixInitiativeFormula", () => {
    it("finds the jacked-in cyberdeck among owned items", () => {
        const actor = {
            items: [
                { type: "weapon", system: {} },
                { type: "cyberdeck", system: { jackedIn: false } },
                { type: "cyberdeck", system: { jackedIn: true, stats: { responseIncrease: 2 } } },
            ],
        };

        expect(findJackedInCyberdeck(actor)?.system?.stats?.responseIncrease).toBe(2);
    });

    it("returns null when no cyberdeck is jacked in", () => {
        const actor = { items: [{ type: "cyberdeck", system: { jackedIn: false } }] };
        expect(findJackedInCyberdeck(actor)).toBeNull();
    });

    it("computes Matrix Initiative as Intelligence + 2x Response Increase, dice = 1 + Response Increase", () => {
        const actor = { system: { attributes: { intelligence: { value: 5, mod: 1 } } } };
        const deck = { system: { stats: { responseIncrease: 2 } } };

        expect(matrixInitiativeFormula(actor, deck)).toEqual({ dice: 3, base: 10 });
    });

    it("computes standard Initiative as Reaction total + max(1, Initiative total) dice", () => {
        const actor = {
            system: {
                attributes: {
                    reaction: { value: 4, mod: 1 },
                    initiative: { value: 1, mod: 2 },
                },
            },
        };

        expect(standardInitiativeFormula(actor)).toEqual({ dice: 3, base: 5 });
    });

    it("floors initiative dice at 1 even if value+mod would go lower", () => {
        const actor = { system: { attributes: { reaction: { value: 3 }, initiative: { value: 0, mod: -5 } } } };
        expect(standardInitiativeFormula(actor).dice).toBe(1);
    });

    it("resolves to Matrix Initiative while jacked in, standard otherwise", () => {
        const jackedActor = {
            items: [{ type: "cyberdeck", system: { jackedIn: true, stats: { responseIncrease: 1 } } }],
            system: { attributes: { intelligence: { value: 6, mod: 0 }, reaction: { value: 3, mod: 0 }, initiative: { value: 1, mod: 0 } } },
        };
        const meatActor = {
            items: [{ type: "cyberdeck", system: { jackedIn: false } }],
            system: { attributes: { intelligence: { value: 6, mod: 0 }, reaction: { value: 3, mod: 0 }, initiative: { value: 1, mod: 0 } } },
        };

        expect(resolveInitiativeFormula(jackedActor)).toEqual({ dice: 2, base: 8 });
        expect(resolveInitiativeFormula(meatActor)).toEqual({ dice: 1, base: 3 });
    });
});
