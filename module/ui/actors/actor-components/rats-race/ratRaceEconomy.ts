export type TransactionKind = "asset" | "income" | "debt" | "expense" | string;

export type TransactionRow = {
   id: string;
   name: string;
   amount: number;
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

   return {
      id: String(item.id ?? item.name),
      name: String(item.name ?? ""),
      amount,
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
