import { describe, expect, it, vi } from "vitest";
import { payDebt } from "./debtPayment";

function transaction(amount: number) {
    const doc = {
        system: { amount },
        update: vi.fn(async (data: Record<string, unknown>) => {
            doc.system.amount = data["system.amount"] as number;
        }),
        delete: vi.fn(async () => {}),
    };
    return doc;
}

describe("payDebt", () => {
    it("pays the debt in full when the stick covers it, without deleting the stick", async () => {
        const debt = transaction(500);
        const stick = transaction(1000);

        const result = await payDebt(debt, stick);

        expect(result.paid).toBe(500);
        expect(stick.system.amount).toBe(500);
        expect(debt.delete).toHaveBeenCalled();
        expect(debt.update).not.toHaveBeenCalled();
    });

    it("pays what it can and leaves a reduced balance when the stick falls short", async () => {
        const debt = transaction(500);
        const stick = transaction(200);

        const result = await payDebt(debt, stick);

        expect(result.paid).toBe(200);
        expect(stick.system.amount).toBe(0);
        expect(debt.update).toHaveBeenCalledWith({ "system.amount": 300 });
        expect(debt.delete).not.toHaveBeenCalled();
    });

    it("deletes the debt exactly when the stick matches it precisely", async () => {
        const debt = transaction(500);
        const stick = transaction(500);

        await payDebt(debt, stick);

        expect(stick.system.amount).toBe(0);
        expect(debt.delete).toHaveBeenCalled();
    });
});
