import { describe, expect, it, vi, afterEach } from "vitest";
import { payDebt } from "./debtPayment";

afterEach(() => { delete (globalThis as Record<string, unknown>).game; });

function transaction(amount: number, extra: Record<string, unknown> = {}) {
    const doc: any = {
        id: "debt1",
        name: "Debt",
        system: { amount, ...extra },
        update: vi.fn(async (data: Record<string, unknown>) => {
            doc.system.amount = data["system.amount"] as number;
        }),
        delete: vi.fn(async () => {}),
    };
    return doc;
}

function stick(amount: number) {
    const doc = {
        system: { amount },
        update: vi.fn(async (data: Record<string, unknown>) => {
            doc.system.amount = data["system.amount"] as number;
        }),
    };
    return doc;
}

function creditor(items: any[] = []) {
    return {
        id: "creditor1",
        items,
        createEmbeddedDocuments: vi.fn().mockResolvedValue([{}]),
    };
}

function setGameAsGM(c: ReturnType<typeof creditor>) {
    (globalThis as Record<string, unknown>).game = {
        user: { isGM: true },
        actors: { get: (id: string) => (id === c.id ? c : undefined) },
    };
}

describe("payDebt", () => {
    it("pays the full requested amount when both the stick and debt cover it", async () => {
        const debt = transaction(500, { creditorId: "creditor1" });
        const paymentStick = stick(1000);
        setGameAsGM(creditor());

        const result = await payDebt(debt, paymentStick, 500);

        expect(result.paid).toBe(500);
        expect(paymentStick.system.amount).toBe(500);
        expect(debt.delete).toHaveBeenCalled();
        expect(debt.update).not.toHaveBeenCalled();
    });

    it("caps the payment at the requested amount even if the stick/debt could cover more", async () => {
        const debt = transaction(500, { creditorId: "creditor1" });
        const paymentStick = stick(1000);
        setGameAsGM(creditor());

        const result = await payDebt(debt, paymentStick, 200);

        expect(result.paid).toBe(200);
        expect(paymentStick.system.amount).toBe(800);
        expect(debt.update).toHaveBeenCalledWith({ "system.amount": 300 });
        expect(debt.delete).not.toHaveBeenCalled();
    });

    it("caps the payment at the stick balance when it falls short of the requested amount", async () => {
        const debt = transaction(500, { creditorId: "creditor1" });
        const paymentStick = stick(150);
        setGameAsGM(creditor());

        const result = await payDebt(debt, paymentStick, 200);

        expect(result.paid).toBe(150);
        expect(paymentStick.system.amount).toBe(0);
    });

    it("delivers the paid amount to the creditor as a new repayment stick", async () => {
        const debt = transaction(500, { creditorId: "creditor1" });
        const paymentStick = stick(1000);
        const c = creditor([]);
        setGameAsGM(c);

        await payDebt(debt, paymentStick, 200);

        expect(c.createEmbeddedDocuments).toHaveBeenCalledWith("Item", [
            expect.objectContaining({
                name: "Debt — Repayment",
                system: expect.objectContaining({ amount: 200, isCreditStick: true }),
                flags: { sr3e: { debtRepaymentFor: "debt1" } },
            }),
        ]);
    });

    it("accumulates onto an existing repayment stick for the same debt instead of creating a new one", async () => {
        const debt = transaction(500, { creditorId: "creditor1" });
        const paymentStick = stick(1000);
        const existingRepaymentStick = {
            system: { isCreditStick: true, amount: 100 },
            getFlag: (_scope: string, key: string) => (key === "debtRepaymentFor" ? "debt1" : undefined),
            update: vi.fn().mockResolvedValue(undefined),
        };
        const c = creditor([existingRepaymentStick]);
        setGameAsGM(c);

        await payDebt(debt, paymentStick, 200);

        expect(existingRepaymentStick.update).toHaveBeenCalledWith({ "system.amount": 300 });
        expect(c.createEmbeddedDocuments).not.toHaveBeenCalled();
    });

    it("does not attempt delivery when the debt has no creditor", async () => {
        const debt = transaction(500);
        const paymentStick = stick(1000);
        const emit = vi.fn();
        (globalThis as Record<string, unknown>).game = { user: { isGM: false }, socket: { emit } };

        await payDebt(debt, paymentStick, 200);

        expect(emit).not.toHaveBeenCalled();
    });
});
