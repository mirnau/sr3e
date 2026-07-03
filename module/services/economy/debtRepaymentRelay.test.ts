import { describe, expect, it, vi, afterEach } from "vitest";
import { registerDebtRepaymentRelay, requestDebtRepaymentDelivery } from "./debtRepaymentRelay";

afterEach(() => { delete (globalThis as Record<string, unknown>).game; });

function creditor(items: any[] = []) {
    return {
        id: "creditor1",
        items,
        createEmbeddedDocuments: vi.fn().mockResolvedValue([{}]),
    };
}

describe("requestDebtRepaymentDelivery", () => {
    it("delivers directly when the current user is GM", async () => {
        const c = creditor();
        (globalThis as Record<string, unknown>).game = {
            user: { isGM: true },
            actors: { get: (id: string) => (id === c.id ? c : undefined) },
        };

        await requestDebtRepaymentDelivery("creditor1", "debt1", "Widget — Debt", 100);

        expect(c.createEmbeddedDocuments).toHaveBeenCalledWith("Item", [
            expect.objectContaining({ name: "Widget — Debt — Repayment", system: expect.objectContaining({ amount: 100 }) }),
        ]);
    });

    it("relays via socket when the current user is not GM", async () => {
        const emit = vi.fn();
        (globalThis as Record<string, unknown>).game = { user: { isGM: false }, socket: { emit } };

        await requestDebtRepaymentDelivery("creditor1", "debt1", "Widget — Debt", 100);

        expect(emit).toHaveBeenCalledWith("system.sr3e", {
            type: "debtRepaymentDelivery",
            creditorActorId: "creditor1",
            debtId: "debt1",
            debtName: "Widget — Debt",
            amount: 100,
        });
    });
});

describe("registerDebtRepaymentRelay", () => {
    it("performs the delivery on the GM's client when a payload arrives", () => {
        const c = creditor();
        let handler: ((payload: unknown) => void) | undefined;
        (globalThis as Record<string, unknown>).game = {
            user: { isGM: true },
            actors: { get: (id: string) => (id === c.id ? c : undefined) },
            socket: { on: (_event: string, cb: (payload: unknown) => void) => { handler = cb; } },
        };

        registerDebtRepaymentRelay();
        handler?.({ type: "debtRepaymentDelivery", creditorActorId: "creditor1", debtId: "debt1", debtName: "Widget — Debt", amount: 100 });

        expect(c.createEmbeddedDocuments).toHaveBeenCalledTimes(1);
    });

    it("ignores the payload on a non-GM client", () => {
        const c = creditor();
        let handler: ((payload: unknown) => void) | undefined;
        (globalThis as Record<string, unknown>).game = {
            user: { isGM: false },
            actors: { get: (id: string) => (id === c.id ? c : undefined) },
            socket: { on: (_event: string, cb: (payload: unknown) => void) => { handler = cb; } },
        };

        registerDebtRepaymentRelay();
        handler?.({ type: "debtRepaymentDelivery", creditorActorId: "creditor1", debtId: "debt1", debtName: "Widget — Debt", amount: 100 });

        expect(c.createEmbeddedDocuments).not.toHaveBeenCalled();
    });
});
