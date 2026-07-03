import { describe, expect, it } from "vitest";
import { economyTotals, formatNuyen, transactionRows } from "./ratRaceEconomy";

describe("ratRaceEconomy", () => {
   it("signs all transaction model kinds and computes net worth", () => {
      const rows = transactionRows([
         tx("rent", "expense", 1_500),
         tx("salary", "income", 4_000),
         tx("loan", "debt", 10_000),
         tx("stock", "asset", 25_000),
      ]);

      expect(economyTotals(rows)).toEqual({
         assets: 25_000,
         income: 4_000,
         debts: 10_000,
         expenses: 1_500,
         netWorth: 17_500,
      });
   });

   it("formats signed nuyen with SR3e sheet grouping", () => {
      expect(formatNuyen(12500)).toBe("12.500 ¥");
      expect(formatNuyen(-12500)).toBe("-12.500 ¥");
   });

   it("filters drained credit sticks out of the ledger", () => {
      const rows = transactionRows([
         tx("empty stick", "asset", 0, { isCreditStick: true }),
         tx("loaded stick", "asset", 500, { isCreditStick: true }),
         tx("empty non-stick asset", "asset", 0),
      ]);

      expect(rows.map(r => r.name).sort()).toEqual(["empty non-stick asset", "loaded stick"]);
   });

   it("carries the debt's originalAmount through for the paid-fraction display", () => {
      const rows = transactionRows([tx("loan", "debt", 700, { originalAmount: 1000 })]);
      expect(rows[0]!.originalAmount).toBe(1000);
   });

   it("falls back originalAmount to the current amount for debts created before the field existed", () => {
      const rows = transactionRows([tx("legacy loan", "debt", 500)]);
      expect(rows[0]!.originalAmount).toBe(500);
   });
});

function tx(name: string, type: string, amount: number, extra: Record<string, unknown> = {}) {
   return { id: name, name, system: { amount, type, ...extra } };
}
