import { describe, expect, it, vi, afterEach } from "vitest";
import { karmaBuySuccess, karmaPoolReroll, notifyKarmaSpendDeclined } from "./karmaRerollCore";

function actor(kp: number, ceiling = kp) {
    return {
        system: { karma: { karmaPool: { value: kp }, karmaPoolCeiling: ceiling } },
        update: vi.fn().mockResolvedValue(undefined),
    };
}

afterEach(() => { delete (globalThis as Record<string, unknown>).game; delete (globalThis as Record<string, unknown>).ui; });

describe("karmaPoolReroll", () => {
    it("declines with insufficient-karma when karma pool balance is too low", async () => {
        const result = await karmaPoolReroll(actor(0), [{ result: 1 }], 4, 0);
        expect(result).toEqual({ ok: false, reason: "insufficient-karma" });
    });

    it("declines with no-failures when there are no failed dice to reroll", async () => {
        const result = await karmaPoolReroll(actor(5), [{ result: 6 }], 4, 0);
        expect(result).toEqual({ ok: false, reason: "no-failures" });
    });
});

describe("karmaBuySuccess", () => {
    it("declines with insufficient-karma when karma pool balance is zero", async () => {
        const result = await karmaBuySuccess(actor(0), [{ result: 6 }], 4);
        expect(result).toEqual({ ok: false, reason: "insufficient-karma" });
    });

    it("declines with no-natural-success without at least one natural success", async () => {
        const result = await karmaBuySuccess(actor(5), [{ result: 1 }], 4);
        expect(result).toEqual({ ok: false, reason: "no-natural-success" });
    });

    it("appends a bought success and returns the karma deduction as data instead of writing it", async () => {
        const a = actor(5, 5);
        const result = await karmaBuySuccess(a, [{ result: 6 }], 4);

        expect(result).toEqual({
            ok: true,
            results: [{ result: 6 }, { result: 4, bought: true }],
            karmaUpdate: { "system.karma.karmaPool.value": 4, "system.karma.karmaPoolCeiling": 4 },
        });
        expect(a.update).not.toHaveBeenCalled();
    });
});

describe("notifyKarmaSpendDeclined", () => {
    it("shows a warning notification for each decline reason", () => {
        const warn = vi.fn();
        (globalThis as Record<string, unknown>).ui = { notifications: { warn } };

        notifyKarmaSpendDeclined("insufficient-karma");
        notifyKarmaSpendDeclined("no-failures");
        notifyKarmaSpendDeclined("no-natural-success");

        expect(warn).toHaveBeenCalledTimes(3);
    });

    it("does not throw when ui.notifications is unavailable", () => {
        expect(() => notifyKarmaSpendDeclined("insufficient-karma")).not.toThrow();
    });
});
