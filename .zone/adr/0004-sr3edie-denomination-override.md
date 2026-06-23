# ADR-0004: SR3Edie registered as denomination "d" — global Die override

## Status
Accepted

## Context
SR3E Rule of Six requires accumulation per die position: rolling a 6 adds to that same die's running total and rerolls, until face ≠ 6 OR total ≥ cap. Foundry's native exploding dice (`x` modifier) spawns additional pool dice instead — each 6 produces a separate result entry, making `countSuccesses` count chain rolls individually. This is mechanically wrong.

## Decision
Introduce `SR3Edie extends foundry.dice.terms.Die` with `DENOMINATION = "d"` and a custom `_evaluate()` that delegates to `sr3eDiceEngine.accumulate()`. Register it at module init via `SR3Edie.Register()` which writes `CONFIG.Dice.terms["d"] = SR3Edie`. This replaces Foundry's standard Die globally for all `dN` formulas.

The native `x` modifier is disabled in `SR3Edie.MODIFIERS` (no-op function) so Foundry never runs its own explosion logic. Our `_evaluate` interprets the presence of `xN` or `x` in the modifier list directly.

## Consequences
- All dice in the system accumulate correctly per SR3E rules.
- Results appear in Foundry's native dice log (no chat rendering hack needed).
- `maximize` / `minimize` paths still work — they bypass accumulation and use face=6/1 directly.
- Any code that relied on Foundry's native explode spawning extra pool dice is broken by design.
