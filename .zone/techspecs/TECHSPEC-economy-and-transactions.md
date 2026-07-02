# Economy and Transactions

## What this is

Turns the read-only Rat's Race ledger (net worth / assets / income / debts / expenses, summed from `Transaction` items) into a lightweight world-economy sim: recurring subscriptions (lifestyle, DocWagon, etc.) must be actively redeemed each in-game month from credit-stick balances, missed payments spiral into a GM-adjudicated debt that quietly compounds interest, and credit sticks are spendable items rather than static ledger flags. This is the general (non-vehicle) economy MUST; vehicle-specific economy remains a separate deferred COULD.

Builds on existing infrastructure: `TransactionModel` (`amount`, `type`, `recurrent`, `isCreditStick`, `creditorId`, `interestPerMonth`, `journalId`), `RatsRace.svelte` + `ratRaceEconomy.ts` (ledger table, totals), `TimeService` (single global world clock, already surfaced in the storyteller screen's `TimeManager.svelte`).

---

## MoSCoW

### MUST

**M1 — Period-tracking schema fields on `TransactionModel`**

Add three optional `StringField`s (default `""`), all system-managed, none exposed in `TransactionApp.svelte`:
- `paidThroughPeriod` — last `"YYYY-MM"` period this recurring expense was successfully paid.
- `lastMissedPeriod` — last `"YYYY-MM"` period a failed Pay attempt already spawned a missed-payment debt for (idempotency guard — repeated Pay clicks in the same unpaid period must not spawn duplicate debts).
- `lastInterestPeriod` — last `"YYYY-MM"` a debt's interest was compounded through.

**M2 — Period helpers**

New file `module/services/economy/period.ts`:
- `currentPeriod(date: Date): string` → `"YYYY-MM"` from `TimeService.getDate()`.
- `monthsBetween(from: string, to: string): number` — elapsed whole months between two `"YYYY-MM"` periods (0 if equal or `from` is `""`).
- `daysUntilMonthEnd(date: Date): number` — for the Rat's Race countdown display.

**M3 — Subscription due/pay flow**

New file `module/services/economy/subscriptionPayment.ts`:
- `isSubscriptionDue(transaction, period): boolean` — `type === "expense" && recurrent && paidThroughPeriod !== period`.
- `availableCreditSticks(items): TransactionRow[]` — items where `isCreditStick && amount > 0`.
- `paySubscription(actor, transaction, creditStickItem, period): Promise<{ ok: boolean }>` — if `creditStickItem.system.amount >= transaction.system.amount`: deduct cost from the stick's `amount`, set `transaction.paidThroughPeriod = period`, return `{ ok: true }`. Else return `{ ok: false }` (no mutation).
- `spawnMissedPaymentDebt(actor, transaction, period): Promise<void>` — no-op if `lastMissedPeriod === period` (idempotency). Otherwise creates a new `Transaction` item: `type: "debt"`, `amount: transaction.system.amount`, `creditorId: transaction.system.creditorId ?? ""`, `interestPerMonth: transaction.system.interestPerMonth ?? 0`, `recurrent: false`, `isCreditStick: false`, name `"${transaction.name} — Missed Payment (${period})"`; then sets the original transaction's `lastMissedPeriod = period`.

The original subscription line is decoupled from any debt it spawns — it simply comes due again next period regardless of whether that debt was ever paid off. No mechanical link, no blocking.

**M4 — Debt paydown ("pay what you can")**

Same file or a sibling `debtPayment.ts`:
- `payDebt(actor, debtTransaction, creditStickItem): Promise<{ paid: number }>` — `paid = min(creditStickItem.system.amount, debtTransaction.system.amount)`. Deduct `paid` from the stick's balance and from the debt's `amount`. If the debt's remaining `amount` reaches 0, delete the debt `Transaction` item. Partial payment is always allowed — no threshold/all-or-nothing gate (unlike subscriptions).

**M5 — Debt interest accrual**

New file `module/services/economy/debtInterest.ts`:
- `applyPendingInterest(transaction, period): { amount: number; lastInterestPeriod: string } | null` — pure function. Returns `null` if `type !== "debt"`, `interestPerMonth <= 0`, or already caught up (`lastInterestPeriod === period`). If `lastInterestPeriod === ""` (freshly created debt), baseline to the current period with no growth. Otherwise compound: `amount * (1 + interestPerMonth / 100) ** monthsBetween(lastInterestPeriod, period)`.
- `registerDebtInterestHook(): void` — `Hooks.on("updateWorldTime", ...)`, gated so it only does work when the in-game month actually changed since the last call (cache last-seen period in module state). On a month change: iterate `game.actors`, their embedded `type === "debt"` items, apply `applyPendingInterest`, persist via `item.update()` for any non-null result. Registered at `ready` in `sr3e.ts` alongside the other `register*Hook()` calls.

**M6 — Rat's Race UI**

`RatsRace.svelte`:
- Read-only game clock (date, from `TimeService.getDate()`, reactive on `updateWorldTime` — same pattern as `TimeManager.svelte`) plus "days until end of month" (M2's `daysUntilMonthEnd`) shown above the ledger table.
- Recurring `expense` rows: a **Pay** button. Clicking opens a credit-stick picker (dropdown/small list of `availableCreditSticks`, player selects one explicitly — no auto-drain across multiple sticks). Confirming calls `paySubscription`; on `{ ok: false }`, call `spawnMissedPaymentDebt` and render the row in a warning/red "Access Denied" style for the remainder of the period (row is unpaid-for-current-period → warning style; this is a simplification — MUST scope does not distinguish "not yet attempted" from "attempted and failed," both render as due/warning until paid).
- `debt` rows: a **Pay** button, always available (not period-gated). Opens the same credit-stick picker; confirming calls `payDebt`. No red/denied state for debts — they just persist and grow via M5 until paid down or a GM deletes the item outright (forgiveness — already supported by existing item deletion, no new code needed).
- Credit-stick (`isCreditStick`) rows with `amount === 0` are filtered out of `transactionRows`/the ledger table (already achievable via a filter in `ratRaceEconomy.ts`), but the item is untouched in the actor's inventory so it can be topped up later by another transaction.

**M7 — Honorary editing: open/delete any row from Rat's Race**

Scope change from the original "GM-only edit/delete" intention — this is a tabletop game running on an honor system, not an enforced ledger. Any row (asset/income/debt/expense/credit-stick alike) must be openable and deletable by whoever's playing the sheet:
- Transaction name in the Rat's Race table becomes a clickable button (replacing/supplementing the current double-click) that opens the transaction's item sheet (`TransactionApp.svelte`), where it's already fully editable.
- Add a trailing `✕` column on every row. Clicking it opens a confirmation modal: "You are about to delete this. Your GM will be informed." On confirm: delete the `Transaction` item and whisper the GM (reusing the `whisperDepletion`-style pattern from `applyMedical.ts` — `game.users` filtered to active GMs) naming the actor, transaction, and amount. No block, no permission gate beyond the whisper — the system does not attempt to prevent cheating, only to make it visible to the GM.

### SHOULD

**S1 — Distinguish "not yet due" from "overdue"**

Render recurring expense rows neutrally until the current period actually starts, rather than warning-styling every unpaid row regardless of whether Pay has been attempted yet. Deferred from MUST because it needs an extra piece of state (or a due-date convention) beyond `paidThroughPeriod` alone.

### COULD

**C1 — Narrative debt collection tooling**

GM-facing helpers for creditor-driven consequences (services, violence, prison time per the dystopian flavor) — intentionally out of scope; the user wants this left to table narration, not automated.

**C2 — Vehicle economy**

Tracked separately as `[ ] COULD: Vehicle economy` in PLAN.md.

---

## Affected files

| File | Change |
|---|---|
| `module/models/items/TransactionModel.ts` | M1 — add `paidThroughPeriod`, `lastMissedPeriod`, `lastInterestPeriod` fields |
| `module/services/economy/period.ts` | M2 — new, period helpers |
| `module/services/economy/subscriptionPayment.ts` | M3 — new, due/pay/spawn-debt logic |
| `module/services/economy/debtInterest.ts` | M4/M5 — new, paydown + interest accrual + hook |
| `module/ui/actors/actor-components/rats-race/RatsRace.svelte` | M6 — clock/countdown display, Pay buttons, credit-stick picker; M7 — name-as-button, ✕ column, confirm modal |
| `module/ui/actors/actor-components/rats-race/ratRaceEconomy.ts` | M6 — filter zero-balance credit sticks out of `transactionRows` |
| `module/services/economy/transactionDeletion.ts` | M7 — new, GM-whisper delete helper |
| `sr3e.ts` | M5 — register `registerDebtInterestHook()` at `ready` |

No new item types. Credit sticks remain a boolean flag (`isCreditStick`) on `Transaction`, per explicit decision to avoid a specialized item type.

---

## Design decisions from grilling

- Credit sticks are `Transaction` items flagged `isCreditStick`, not a new item type — deliberately kept simple.
- Settlement is per-line (player picks what to pay and in what order), not a single bulk "Settle Payments" button — this is the point: it creates hard choices under scarcity.
- A missed subscription payment auto-spawns a one-time debt; the debt is fully decoupled from the subscription afterward (subscription resets next period regardless; debt is paid down independently).
- Debt has no mechanical collection consequence beyond compounding interest — collection/violence/forgiveness is entirely GM narration, with forgiveness = GM deletes the debt item (already supported, no new code).
- Multi-credit-stick payments require the player to pick exactly one stick; insufficient balance on that stick fails the payment even if another stick could have covered it.
