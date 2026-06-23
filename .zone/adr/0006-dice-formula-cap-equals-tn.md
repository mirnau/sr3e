# ADR-0006: buildFormula uses cap=TN — three formula types

## Status
Accepted (supersedes ADR-0002)

## Context
ADR-0002 locked `buildFormula` to `d6x6` because Foundry's native explode mechanic used the `x` threshold as the trigger face. Once SR3Edie owns `_evaluate`, the `x` modifier is interpreted by our own accumulation engine — `xN` means "stop accumulating when total >= N", not "explode when face == N".

SR3E has three distinct dice modes:
1. **Combat / advanced roll**: chain stops when accumulated total reaches or exceeds TN. Cap=TN is efficient and correct — no point rolling past a success.
2. **Single-click skill roll**: no TN in scope; chain is uncapped (infinite). Results are raw; GM interprets.
3. **Initiative**: no explosion at all. Dice are summed normally.

## Decision
Three formula builders in `diceFormula.ts`:
- `buildFormula(state)` → `${pool}d6x${TN}` — cap=TN
- `buildInfiniteFormula(pool)` → `${pool}d6x` — infinite cap
- `buildInitiativeFormula(pool)` → `${pool}d6` — no explosion

Each maps to a distinct `SR3ERoll` factory:
- `SR3ERoll.build(pool, tn)` — for `buildFormula`
- `SR3ERoll.buildOpen(pool)` — for `buildInfiniteFormula` (tn=null, `countSuccesses()` returns null)
- `buildInitiativeFormula` → used raw with Foundry's `Roll`, not via SR3ERoll

## Consequences
- Formula and cap are unified — the TN in the formula IS the stop condition. Do not separate them again.
- Open rolls never count successes programmatically; GM decides.
- `d6x6` is gone entirely — it was an intermediate wrong state.
