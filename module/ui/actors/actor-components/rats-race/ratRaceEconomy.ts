export type TransactionKind = "asset" | "income" | "debt" | "expense" | string;

export type TransactionRow = {
   id: string;
   name: string;
   amount: number;
   originalAmount: number;
   type: TransactionKind;
   recurrent: boolean;
   isCreditStick: boolean;
   interestPerMonth: number;
   signedAmount: number;
};

export type EconomyTotals = {
   assets: number;
   income: number;
   debts: number;
   expenses: number;
   netWorth: number;
};

export function transactionRows(items: Array<Record<string, any>>): TransactionRow[] {
   return items
      .map(toTransactionRow)
      .filter(row => !(row.isCreditStick && row.amount === 0))
      .sort((a, b) => typeRank(a.type) - typeRank(b.type) || a.name.localeCompare(b.name));
}

export function economyTotals(rows: TransactionRow[]): EconomyTotals {
   return rows.reduce(
      (totals, row) => ({
         assets: totals.assets + (row.type === "asset" ? row.amount : 0),
         income: totals.income + (row.type === "income" ? row.amount : 0),
         debts: totals.debts + (row.type === "debt" ? row.amount : 0),
         expenses: totals.expenses + (row.type === "expense" ? row.amount : 0),
         netWorth: totals.netWorth + row.signedAmount,
      }),
      { assets: 0, income: 0, debts: 0, expenses: 0, netWorth: 0 },
   );
}

export function formatNuyen(amount: number): string {
   const sign = amount < 0 ? "-" : "";
   return `${sign}${Math.abs(amount).toLocaleString("de-DE")} ¥`;
}

function toTransactionRow(item: Record<string, any>): TransactionRow {
   const system = item.system ?? {};
   const amount = Number(system.amount ?? 0);
   const type = String(system.type ?? "");
   // Debts created before this field existed (or edited manually) have no
   // originalAmount — falling back to the current amount reads as "100%
   // remaining, nothing paid yet" instead of a nonsensical amount/0 fraction.
   const originalAmount = Number(system.originalAmount ?? 0) || amount;

   return {
      id: String(item.id ?? item.name),
      name: String(item.name ?? ""),
      amount,
      originalAmount,
      type,
      recurrent: Boolean(system.recurrent),
      isCreditStick: Boolean(system.isCreditStick),
      interestPerMonth: Number(system.interestPerMonth ?? 0),
      signedAmount: signedAmount(type, amount),
   };
}

function signedAmount(type: TransactionKind, amount: number): number {
   return type === "debt" || type === "expense" ? -amount : amount;
}

function typeRank(type: TransactionKind): number {
   return ["asset", "income", "debt", "expense"].indexOf(type) + 1 || 99;
}
