import { describe, expect, it, vi } from "vitest";
import { spendProcedureFocus, spendProcedurePool } from "./poolSpend";

describe("spendProcedurePool", () => {
    it("returns actor dice pool updates for normal pools", async () => {
        const actor = { system: { dicePools: { spell: { spent: 1 } } } };
        await expect(spendProcedurePool(actor, "spell", 2)).resolves.toEqual({ "system.dicePools.spell.spent": 3 });
    });

    it("updates focus item spent dice for item-backed focus pools", async () => {
        const update = vi.fn();
        const actor = {
            items: {
                get: () => ({ system: { dice: { spent: 1 } }, update }),
            },
        };
        await expect(spendProcedurePool(actor, "focus:abc", 2)).resolves.toEqual({});
        expect(update).toHaveBeenCalledWith({ "system.dice.spent": 3 }, { render: false });
    });

    it("spends additive focus dice separately from actor pool dice", async () => {
        const update = vi.fn();
        const actor = { items: { get: () => ({ system: { dice: { spent: 2 } }, update }) } };
        await spendProcedureFocus(actor, "focus:abc", 3);
        expect(update).toHaveBeenCalledWith({ "system.dice.spent": 5 }, { render: false });
    });
});
