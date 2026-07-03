<script lang="ts">
   import { onMount, untrack } from "svelte";
   import { localize } from "../../../../services/utilities";
   import { TimeService } from "../../../../services/time/TimeService";
   import { currentPeriod, daysUntilMonthEnd } from "../../../../services/economy/period";
   import { availableCreditSticks, defaultOnSubscription, isSubscriptionDue, paySubscription } from "../../../../services/economy/subscriptionPayment";
   import { payDebt } from "../../../../services/economy/debtPayment";
   import { deleteTransaction } from "../../../../services/economy/transactionDeletion";
   import { transferBetweenSticks } from "../../../../services/economy/stickTransfer";
   import { economyTotals, formatNuyen, transactionRows } from "./ratRaceEconomy";
   import { DebtPaymentDialogApp } from "../../../../sheets/actors/DebtPaymentDialogApp";
   import CreditStickPicker from "./CreditStickPicker.svelte";
   import TransferDialog from "./TransferDialog.svelte";

   const p = $props<{ actor: Actor; transactions: Item[] }>();
   const actor = untrack(() => p.actor);

   let worldDate = $state(TimeService.Instance().getDate());

   onMount(() => {
      const hookId = Hooks.on("updateWorldTime", () => {
         worldDate = TimeService.Instance().getDate();
      });
      return () => { Hooks.off("updateWorldTime", hookId); };
   });

   const period = $derived(currentPeriod(worldDate));
   const daysLeft = $derived(daysUntilMonthEnd(worldDate));

   const rows = $derived(transactionRows(p.transactions as any[]));
   const totals = $derived(economyTotals(rows));
   const sticks = $derived(availableCreditSticks(p.transactions as any[]) as unknown as Item[]);
   const allSticks = $derived((p.transactions as Item[]).filter((item) => Boolean((item.system as any).isCreditStick)));

   let payingRowId = $state<string | null>(null);
   let transferringRowId = $state<string | null>(null);

   function typeLabel(type: string): string {
      const key = CONFIG.SR3E.TRANSACTION_TYPES[type as keyof typeof CONFIG.SR3E.TRANSACTION_TYPES];
      return key ? localize(key) : type;
   }

   function openTransaction(id: string) {
      p.transactions.find((item: Item) => item.id === id)?.sheet?.render(true);
   }

   function findTransaction(id: string) {
      return p.transactions.find((item: Item) => item.id === id);
   }

   async function confirmSubscriptionPayment(rowId: string, stick: Item) {
      const transaction = findTransaction(rowId);
      if (!transaction) return;

      await paySubscription(transaction as any, stick as any, period);
      payingRowId = null;
   }

   async function handleDefault(rowId: string) {
      const transaction = findTransaction(rowId);
      if (!transaction) return;

      const confirmed = await foundry.applications.api.DialogV2.confirm({
         window: { title: localize(CONFIG.SR3E.MODAL.defaultsubscriptiontitle) },
         content: localize(CONFIG.SR3E.MODAL.defaultsubscription),
         yes: { label: localize(CONFIG.SR3E.MODAL.confirm), default: true },
         no: { label: localize(CONFIG.SR3E.MODAL.decline) },
         modal: true,
         rejectClose: true,
      });
      if (confirmed) await defaultOnSubscription(actor as any, transaction as any, period);
   }

   async function confirmDebtPayment(rowId: string, stick: Item, amount: number) {
      const debt = findTransaction(rowId);
      if (!debt) return;

      await payDebt(debt as any, stick as any, amount);
   }

   function openDebtPaymentDialog(rowId: string, debtRemaining: number) {
      new DebtPaymentDialogApp(
         debtRemaining,
         sticks,
         (stick, amount) => confirmDebtPayment(rowId, stick, amount),
      ).render(true);
   }

   const dueRowIds = $derived(new Set(
      (p.transactions as any[])
         .filter((item) => isSubscriptionDue(item, period))
         .map((item) => String(item.id)),
   ));

   function isSubscriptionRow(row: { type: string; recurrent: boolean }): boolean {
      return row.type === "expense" && row.recurrent;
   }

   function isDebtRow(row: { type: string }): boolean {
      return row.type === "debt";
   }

   async function confirmTransfer(rowId: string, target: Item, amount: number) {
      const source = findTransaction(rowId);
      if (!source) return;

      await transferBetweenSticks(source as any, target as any, amount);
      transferringRowId = null;
   }

   async function handleDelete(rowId: string) {
      const transaction = findTransaction(rowId);
      if (!transaction) return;

      const confirmed = await foundry.applications.api.DialogV2.confirm({
         window: { title: localize(CONFIG.SR3E.MODAL.deletetransactiontitle) },
         content: localize(CONFIG.SR3E.MODAL.deletetransaction),
         yes: { label: localize(CONFIG.SR3E.MODAL.confirm), default: true },
         no: { label: localize(CONFIG.SR3E.MODAL.decline) },
         modal: true,
         rejectClose: true,
      });
      if (confirmed) await deleteTransaction(actor, transaction as any);
   }
</script>

<div class="rats-race-panel">
   <div class="rats-race-clock">
      <span>{worldDate.toLocaleDateString()}</span>
      <span>{daysLeft} day{daysLeft === 1 ? "" : "s"} until bills are due</span>
   </div>

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
            <th></th>
            <th></th>
         </tr>
      </thead>
      <tbody>
         {#each rows as row (row.id)}
            <tr class:negative-row={isSubscriptionRow(row) && dueRowIds.has(row.id)}>
               <td>
                  <button type="button" onclick={() => openTransaction(row.id)}>
                     {row.name}
                  </button>
               </td>
               <td>{typeLabel(row.type)}</td>
               <td>
                  {#if isDebtRow(row) && row.originalAmount > row.amount}
                     {formatNuyen(row.originalAmount - row.amount)} / {formatNuyen(row.originalAmount)} paid
                  {:else}
                     {formatNuyen(row.amount)}
                  {/if}
               </td>
               <td>{row.interestPerMonth}%</td>
               <td>{row.recurrent ? "Yes" : "No"}</td>
               <td>{row.isCreditStick ? "Yes" : "No"}</td>
               <td class:negative={row.signedAmount < 0}>{formatNuyen(row.signedAmount)}</td>
               <td class="rats-race-actions">
                  {#if isSubscriptionRow(row)}
                     {#if payingRowId === row.id}
                        <CreditStickPicker
                           {sticks}
                           onconfirm={(stick) => confirmSubscriptionPayment(row.id, stick)}
                           oncancel={() => (payingRowId = null)}
                        />
                     {:else if dueRowIds.has(row.id)}
                        <button type="button" onclick={() => (payingRowId = row.id)}>Pay</button>
                        <button type="button" onclick={() => handleDefault(row.id)}>Default</button>
                     {:else}
                        <button type="button" disabled>Paid</button>
                     {/if}
                  {:else if isDebtRow(row)}
                     <button type="button" onclick={() => openDebtPaymentDialog(row.id, row.amount)}>Pay</button>
                  {:else if row.isCreditStick}
                     {#if transferringRowId === row.id}
                        <TransferDialog
                           source={findTransaction(row.id)}
                           targets={allSticks.filter((s) => s.id !== row.id)}
                           onconfirm={(target, amount) => confirmTransfer(row.id, target, amount)}
                           oncancel={() => (transferringRowId = null)}
                        />
                     {:else}
                        <button type="button" onclick={() => (transferringRowId = row.id)}>Transfer</button>
                     {/if}
                  {/if}
               </td>
               <td class="rats-race-actions">
                  <span
                     class="rats-race-delete-icon"
                     role="button"
                     tabindex="0"
                     onclick={() => handleDelete(row.id)}
                     onkeydown={(e) => (e.key === "Enter" || e.key === " ") && handleDelete(row.id)}
                  >✕</span>
               </td>
            </tr>
         {:else}
            <tr>
               <td colspan="9" class="rats-race-empty">No transactions</td>
            </tr>
         {/each}
      </tbody>
   </table>
</div>
