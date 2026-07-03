// Delivers a debt payment to the creditor's actor. Always executed on the GM's
// client (the payer usually has no permission to even read the creditor's
// items, let alone write to them) so the find-or-create decision below is
// made against a client that can actually see the creditor's full inventory.

const SOCKET_EVENT = "system.sr3e";
const REPAYMENT_FLAG = "debtRepaymentFor";

type DebtRepaymentPayload = {
    type: "debtRepaymentDelivery";
    creditorActorId: string;
    debtId: string;
    debtName: string;
    amount: number;
};

function currentUserIsGM(): boolean {
    return !!(typeof game !== "undefined" ? (game.user as unknown as { isGM?: boolean } | undefined)?.isGM : false);
}

function getActor(actorId: string): Actor | undefined {
    if (typeof game === "undefined" || !game.actors) return undefined;
    return (game.actors.get(actorId) as Actor | undefined) ?? undefined;
}

// Reuses one accumulating stick per debt, tagged with the debt's id, instead
// of minting a new stick per installment — if that stick gets spent/deleted
// in between payments, the next payment just mints a fresh one in its place.
async function deliverRepayment(creditorActorId: string, debtId: string, debtName: string, amount: number): Promise<void> {
    const creditor = getActor(creditorActorId);
    if (!creditor) return;

    const existing = [...(creditor.items ?? [])].find((i: any) =>
        Boolean(i.system?.isCreditStick) && i.getFlag?.("sr3e", REPAYMENT_FLAG) === debtId,
    ) as any;

    if (existing) {
        await existing.update?.({ "system.amount": (existing.system.amount ?? 0) + amount });
        return;
    }

    await creditor.createEmbeddedDocuments?.("Item", [{
        name: `${debtName} — Repayment`,
        type: "transaction",
        system: {
            amount,
            originalAmount: 0,
            type: "asset",
            recurrent: false,
            isCreditStick: true,
            creditorId: "",
            interestPerMonth: 0,
        },
        flags: { sr3e: { [REPAYMENT_FLAG]: debtId } },
    }]);
}

export async function requestDebtRepaymentDelivery(
    creditorActorId: string,
    debtId: string,
    debtName: string,
    amount: number,
): Promise<void> {
    if (currentUserIsGM()) {
        await deliverRepayment(creditorActorId, debtId, debtName, amount);
        return;
    }

    (game.socket as unknown as { emit: (event: string, data: unknown) => void } | undefined)
        ?.emit(SOCKET_EVENT, { type: "debtRepaymentDelivery", creditorActorId, debtId, debtName, amount });
}

export function registerDebtRepaymentRelay(): void {
    if (typeof game === "undefined" || !game.socket) return;

    (game.socket as unknown as { on: (event: string, handler: (payload: unknown) => void) => void })
        .on(SOCKET_EVENT, (payload: unknown) => {
            if (!currentUserIsGM()) return;

            const p = payload as DebtRepaymentPayload;
            if (p.type === "debtRepaymentDelivery") {
                void deliverRepayment(p.creditorActorId, p.debtId, p.debtName, p.amount);
            }
        });
}
