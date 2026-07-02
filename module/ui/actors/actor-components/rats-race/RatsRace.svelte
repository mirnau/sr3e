<script lang="ts">
   import { localize } from "../../../../services/utilities";
   import { economyTotals, formatNuyen, transactionRows } from "./ratRaceEconomy";

   const p = $props<{ transactions: Item[] }>();

   const rows = $derived(transactionRows(p.transactions as any[]));
   const totals = $derived(economyTotals(rows));

   function typeLabel(type: string): string {
      const key = CONFIG.SR3E.TRANSACTION_TYPES[type as keyof typeof CONFIG.SR3E.TRANSACTION_TYPES];
      return key ? localize(key) : type;
   }

   function openTransaction(id: string) {
      p.transactions.find((item) => item.id === id)?.sheet?.render(true);
   }
</script>

<div class="rats-race-panel">
   <div class="rats-race-summary">
      <div>
         <span>Net Worth</span>
         <strong class:negative={totals.netWorth < 0}>{formatNuyen(totals.netWorth)}</strong>
      </div>
      <div><span>Assets</span><strong>{formatNuyen(totals.assets)}</strong></div>
      <div><span>Income</span><strong>{formatNuyen(totals.income)}</strong></div>
      <div><span>Debts</span><strong class="negative">{formatNuyen(-totals.debts)}</strong></div>
      <div><span>Expenses</span><strong class="negative">{formatNuyen(-totals.expenses)}</strong></div>
   </div>

   <table class="rats-race-table">
      <thead>
         <tr>
            <th>{localize(CONFIG.SR3E.TRANSACTION.transaction)}</th>
            <th>{localize(CONFIG.SR3E.TRANSACTION.type)}</th>
            <th>{localize(CONFIG.SR3E.TRANSACTION.amount)}</th>
            <th>{localize(CONFIG.SR3E.TRANSACTION.interestpermonth)}</th>
            <th>{localize(CONFIG.SR3E.TRANSACTION.recurrent)}</th>
            <th>{localize(CONFIG.SR3E.TRANSACTION.creditstick)}</th>
            <th>Net</th>
         </tr>
      </thead>
      <tbody>
         {#each rows as row (row.id)}
            <tr ondblclick={() => openTransaction(row.id)}>
               <td>{row.name}</td>
               <td>{typeLabel(row.type)}</td>
               <td>{formatNuyen(row.amount)}</td>
               <td>{row.interestPerMonth}%</td>
               <td>{row.recurrent ? "Yes" : "No"}</td>
               <td>{row.isCreditStick ? "Yes" : "No"}</td>
               <td class:negative={row.signedAmount < 0}>{formatNuyen(row.signedAmount)}</td>
            </tr>
         {:else}
            <tr>
               <td colspan="7" class="rats-race-empty">No transactions</td>
            </tr>
         {/each}
      </tbody>
   </table>
</div>
