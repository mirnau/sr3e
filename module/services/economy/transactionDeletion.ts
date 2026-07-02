import { formatNuyen } from "../../ui/actors/actor-components/rats-race/ratRaceEconomy";

type TransactionItem = {
    name?: string;
    system: { amount: number };
    delete?: () => Promise<unknown>;
};

async function whisperTransactionDeleted(actor: Actor, transaction: TransactionItem): Promise<void> {
    const gmIds: string[] = ((game as any).users ?? [])
        .filter((u: any) => u.isGM && u.active)
        .map((u: any) => u.id);
    if (gmIds.length === 0) return;

    const content = game.i18n.format(CONFIG.SR3E.TRANSACTION.deletedChat, {
        actorName: actor.name ?? "",
        name: transaction.name ?? "",
        amount: formatNuyen(transaction.system.amount),
    });
    await (ChatMessage as any).create?.({ content, whisper: gmIds });
}

export async function deleteTransaction(actor: Actor, transaction: TransactionItem): Promise<void> {
    await whisperTransactionDeleted(actor, transaction);
    await transaction.delete?.();
}
