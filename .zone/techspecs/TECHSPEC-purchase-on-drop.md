# Purchase on Drop

## What this is

When a commodity item (one with a `Commodity` profile — `cost`, `streetIndex`, etc.) is dragged onto a `CharacterSheet`, opens a purchase dialog instead of silently embedding it. The player confirms a price (defaulting to `cost * streetIndex`), then picks how to settle it: pay upfront from a credit stick, register a debt with a creditor, or grant it for free. If the item came from another actor's sheet (a PC-to-PC sale/gift), the source item is removed from the seller, and a paid-upfront sale credits the seller with a new credit stick.

Also adds a credit-stick-to-credit-stick **Transfer** action in the Rat's Race tab, needed as a companion feature: since a purchase blocks outright on insufficient stick balance (no auto-split across sticks), players need a way to consolidate nuyen from several low-value sticks into one before a big purchase.

Builds on existing infrastructure: `CommodityModel` (`module/models/items/item-components/Commodity.ts`), `TransactionModel` (`isCreditStick`, `creditorId`, `interestPerMonth`, `type`), `CreditStickPicker.svelte`, the `FuzzyFinder`-based creditor picker pattern from `TransactionApp.svelte`, the `_onDropItem` branch pattern in `CharacterSheet.ts` (same insertion point as `mutateMetatype`/magic-item handling), and the Svelte-dialog-via-ApplicationV2 pattern from `CharacterCreationDialog.svelte`.

---

## MoSCoW

### MUST

**M1 — Purchase trigger in `_onDropItem`**

`CharacterSheet.ts`'s `_onDropItem`: add a branch, evaluated after the `metatype`/magic-item/`skill` branches, before the `super._onDropItem` fallthrough — for any dropped item whose `system.cost` exists (i.e. its data model composes `CommodityModel`) and resolves to `cost * streetIndex > 0`. Bypasses `super._onDropItem`'s default embed entirely; the dialog's own confirm handler creates the embedded item. Scope: `CharacterSheet` only — other actor sheet types are untouched.

**M2 — `PurchaseDialog.svelte`**

New file `module/ui/dialogs/PurchaseDialog.svelte`, mounted via an `ApplicationV2` wrapper (same pattern as `CharacterCreationDialog.svelte`). Props: buyer actor, the dropped item, and (if the drop's source resolves to an owning actor) that seller actor.

Layout:
- Item name + recommended price, shown as an editable number field defaulting to `item.system.cost * item.system.streetIndex`.
- Three mutually exclusive modes (radio/tab toggle): **Pay upfront**, **Register debt**, **Grant free**. Selecting a mode swaps the visible sub-form.
  - **Pay upfront**: reuses `CreditStickPicker.svelte` filtered to the buyer's `isCreditStick && amount > 0` items. Confirm is blocked (with a warning) if the selected stick's `amount < price` — no partial/auto-split.
  - **Register debt**: a `FuzzyFinder` creditor picker over `game.actors` (same options-building logic as `TransactionApp.svelte`'s `creditorOptions` effect), defaulting to the seller actor's id if this is an actor-to-actor drop, else blank. An `interestPerMonth` number field defaults to `20`, editable.
  - **Grant free**: no sub-form. Item is embedded with no transaction created on either side.
- OK / Cancel. Cancel closes the dialog with zero side effects — no item added, nothing deleted, no transaction created, regardless of how far the player got filling in the form.

**M3 — `module/services/economy/purchase.ts`**

New service, invoked by the dialog's OK handler:
- `commodityPrice(item): number` — `item.system.cost * item.system.streetIndex`, or `0`/`undefined` if the item has no `Commodity` component.
- `completePurchase(buyer, item, seller, mode, details): Promise<void>` — orchestrates, in order:
  1. `buyer.createEmbeddedDocuments("Item", [item.toObject()])`.
  2. If `mode === "pay"`: deduct `price` from the chosen stick's `amount` via `item.update` (the stick belongs to `buyer`).
  3. If `mode === "debt"`: create a new `Transaction` item on `buyer`: `type: "debt"`, `amount: price`, `creditorId: details.creditorId`, `interestPerMonth: details.interestPerMonth`, `recurrent: false`, `isCreditStick: false`, name `"${item.name} — Debt"`.
  4. If `seller` is present (actor-to-actor drop): delete the source item from `seller` (`seller.deleteEmbeddedDocuments`) — unconditional across all three modes, since dragging is the transfer-of-possession itself. No permission pre-check: the drag originates from the seller's own sheet, so the acting user already has rights there.
  5. If `seller` is present **and** `mode === "pay"`: create a new credit-stick `Transaction` item on `seller`: `isCreditStick: true`, `amount: price`, `type: "asset"`, name `"${item.name} — Sale Proceeds"`. (Debt mode needs no proceeds stick — the seller is already the registered `creditorId` and collects later via the existing debt-paydown flow. Free mode creates nothing.)

No legality/permit checks — `Commodity.legality` is unrelated to this flow.

**M4 — Credit-stick Transfer in Rat's Race**

New file `module/services/economy/stickTransfer.ts`:
- `transferBetweenSticks(sourceStick, targetStick, amount): Promise<void>` — validates `amount <= sourceStick.system.amount` (caller/dialog is responsible for capping the input; this just guards). Deducts `amount` from `sourceStick`, adds it to `targetStick`, both via `item.update`. Zero-balance sticks are never auto-deleted (existing rule, unchanged).

`RatsRace.svelte`: each `isCreditStick` row gets a **Transfer** button. Opens a small dialog (new `module/ui/actors/actor-components/rats-race/TransferDialog.svelte`, or inline if small enough) — amount field (defaults to full balance, capped at source balance, no overdraft) + dropdown of the same actor's *other* credit sticks as the target. Same-actor only; sending to another actor's stick is out of scope (that path already exists via the purchase dialog's pay-mode proceeds).

**M5 — Localization**

New `MODAL`/dialog strings in `lang/config/CommonConfig.ts` and `lang/en.json`: purchase dialog title, mode labels (Pay upfront / Register debt / Grant free), recommended-price label, insufficient-funds warning, transfer dialog title/labels. Follows existing `MODAL_KEYS` conventions already used for `goblinizecharacter`/`defaultsubscription`.

### COULD

**C1 — Haggling/negotiation mechanics**

The price field is freely editable with no mechanical tie-in (no Negotiation test, no reputation effects). Left as manual/honorary, consistent with the economy techspec's stance on not over-automating social mechanics.

**C2 — Legality/permit enforcement at purchase time**

`Commodity.legality` (status/permit/priority) could gate or warn on illegal purchases. Deferred — no current use case driving it.

---

## Affected files

| File | Change |
|---|---|
| `module/sheets/actors/CharacterSheet.ts` | M1 — new `_onDropItem` branch gating on commodity cost |
| `module/ui/dialogs/PurchaseDialog.svelte` | M2 — new, Pay/Debt/Free dialog |
| `module/services/economy/purchase.ts` | M3 — new, `commodityPrice`, `completePurchase` |
| `module/services/economy/stickTransfer.ts` | M4 — new, `transferBetweenSticks` |
| `module/ui/actors/actor-components/rats-race/TransferDialog.svelte` | M4 — new, transfer amount + target-stick picker |
| `module/ui/actors/actor-components/rats-race/RatsRace.svelte` | M4 — Transfer button per credit-stick row |
| `lang/config/CommonConfig.ts` | M5 — new dialog/modal strings |
| `lang/en.json` | M5 — new translation keys |

No new item types, no changes to `TransactionModel` or `CommodityModel` schemas — this composes entirely from existing fields.

---

## Design decisions from grilling

- Three-way payment mode (Pay / Debt / Free) rather than mandatory payment — Free covers GM grants and chargen loot without a separate bypass flag.
- Insufficient stick balance blocks the purchase outright (no auto-split, no overdraft) — mirrors `paySubscription`'s existing insufficient-funds behavior. This is why Transfer (M4) exists: it's the escape valve for being stuck with scattered low-value sticks.
- Debt interest defaults to 20%/month in the dialog, editable — not silently defaulted to 0 like `defaultOnSubscription`'s auto-spawned debts, since a purchase-time debt is a deliberate negotiated term, not a missed-payment penalty.
- Dialog is a dedicated Svelte component (`PurchaseDialog.svelte`) via the `CharacterCreationDialog` ApplicationV2-mount pattern, not inline `DialogV2` HTML — the Pay/Debt/Free mode switch plus stick picker plus `FuzzyFinder` creditor picker is too much interactive state for raw `DialogV2.confirm`.
- Purchase flow applies uniformly regardless of drop source (compendium, sidebar, or another actor's sheet) — the Free option already covers cases where no real transaction should occur, so no separate source-detection gate was needed.
- Actor-to-actor drops: the source item is deleted from the seller unconditionally (drag = transfer of possession), and a Pay-mode purchase mints the seller a new `"<item> — Sale Proceeds"` credit stick — no permission pre-check, since the acting user already owns the sheet they're dragging from.
- Debt-mode actor-to-actor sales don't mint a proceeds stick for the seller — the seller is simply set as `creditorId` and collects later through the existing debt-paydown flow, avoiding a redundant payment channel.
- Transfer is same-actor-only (a personal stick-consolidation tool) and capped at the source stick's balance (no overdraft) — cross-actor money movement already has a dedicated path through the purchase dialog.
- Purchase flow scoped to `CharacterSheet` only, not generalized to other actor sheet types.
- Recommended price = `cost * streetIndex`, not raw `cost` — reflects SR3E's black-market markup on restricted/forbidden gear by default, though the field remains freely editable.
