import { describe, expect, it, vi } from "vitest";
import { availableCreditSticks, defaultOnSubscription, isSubscriptionDue, paySubscription } from "./subscriptionPayment";

function transaction(overrides: Record<string, unknown> = {}) {
    const system = {
        amount: 1000,
        type: "expense",
        recurrent: true,
        isCreditStick: false,
        creditorId: "",
        interestPerMonth: 0,
        paidThroughPeriod: "",
        lastMissedPeriod: "",
        ...overrides,
    };
    const doc = {
        name: "Lifestyle",
        system,
        update: vi.fn(async (data: Record<string, unknown>) => {
            for (const [path, value] of Object.entries(data)) {
                const key = path.replace("system.", "");
                (doc.system as Record<string, unknown>)[key] = value;
            }
        }),
    };
    return doc;
}

describe("isSubscriptionDue", () => {
    it("is due when recurrent expense hasn't been paid for the period", () => {
        expect(isSubscriptionDue(transaction(), "2077-03")).toBe(true);
    });

    it("is not due once paid through the current period", () => {
        expect(isSubscriptionDue(transaction({ paidThroughPeriod: "2077-03" }), "2077-03")).toBe(false);
    });

    it("ignores non-expense or non-recurrent transactions", () => {
        expect(isSubscriptionDue(transaction({ type: "debt" }), "2077-03")).toBe(false);
        expect(isSubscriptionDue(transaction({ recurrent: false }), "2077-03")).toBe(false);
    });
});

describe("availableCreditSticks", () => {
    it("filters to credit sticks with a positive balance", () => {
        const sticks = [
            transaction({ isCreditStick: true, amount: 500 }),
            transaction({ isCreditStick: true, amount: 0 }),
            transaction({ isCreditStick: false, amount: 500 }),
        ];
        expect(availableCreditSticks(sticks)).toEqual([sticks[0]]);
    });
});

describe("paySubscription", () => {
    it("deducts cost and marks the period paid when the stick can cover it", async () => {
        const sub = transaction({ amount: 500 });
        const stick = transaction({ isCreditStick: true, amount: 1000 });

        const result = await paySubscription(sub, stick, "2077-03");

        expect(result.ok).toBe(true);
        expect(stick.system.amount).toBe(500);
        expect(sub.system.paidThroughPeriod).toBe("2077-03");
    });

    it("fails without mutating anything when the stick balance is insufficient", async () => {
        const sub = transaction({ amount: 500 });
        const stick = transaction({ isCreditStick: true, amount: 100 });

        const result = await paySubscription(sub, stick, "2077-03");

        expect(result.ok).toBe(false);
        expect(stick.system.amount).toBe(100);
        expect(sub.system.paidThroughPeriod).toBe("");
    });
});

describe("defaultOnSubscription", () => {
    it("creates a debt transaction and flags the defaulted period", async () => {
        const sub = transaction({ amount: 500, creditorId: "actor1", interestPerMonth: 5 });
        const createEmbeddedDocuments = vi.fn().mockResolvedValue([{}]);
        const actor = { createEmbeddedDocuments };

        await defaultOnSubscription(actor, sub, "2077-03");

        expect(createEmbeddedDocuments).toHaveBeenCalledWith("Item", [
            expect.objectContaining({
                name: "Lifestyle — Defaulted Payment (2077-03)",
                type: "transaction",
                system: expect.objectContaining({
                    amount: 500,
                    type: "debt",
                    creditorId: "actor1",
                    interestPerMonth: 5,
                }),
            }),
        ]);
        expect(sub.system.lastMissedPeriod).toBe("2077-03");
    });

    it("does not spawn a duplicate debt for the same period", async () => {
        const sub = transaction({ lastMissedPeriod: "2077-03" });
        const createEmbeddedDocuments = vi.fn();
        const actor = { createEmbeddedDocuments };

        await defaultOnSubscription(actor, sub, "2077-03");

        expect(createEmbeddedDocuments).not.toHaveBeenCalled();
    });
});
