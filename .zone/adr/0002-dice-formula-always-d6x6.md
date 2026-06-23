# ADR-0002: Dice formula always uses d6x6, never d6x{TN}

## Status
Superseded by [ADR-0006](0006-dice-formula-cap-equals-tn.md)

## Context
Foundry's `x` notation means "explode (reroll and add) when a die result meets the threshold". SR3E Rule of Six says only a result of exactly 6 triggers a reroll-and-add chain. TN is used only for success comparison, not for explosion.

An earlier implementation used `d6x{TN}` which would cause dice to explode at the TN value — mechanically wrong for any TN other than 6.

## Decision
`buildFormula` in `diceFormula.ts` always produces `${total}d6x6`. The `explodes` parameter was removed. TN is stored separately in `RollState.targetNumber` and applied at success-counting time.

## Consequences
- Rule of Six is correctly modeled: only 6 triggers an exploding chain.
- Rule of One (all dice show 1 = glitch) is unaffected; counted in `SR3ERoll.isGlitch()`.
- Initiative rolls are handled separately (no explosion) — callers must use a plain sum formula there.

## Superseded by
ADR-0006. Once SR3Edie replaced Foundry's native Die, `x` notation is handled by our own accumulation engine — not Foundry's explode mechanic. The cap in `d6x{TN}` now means "stop accumulating when total >= TN", not "explode at TN". This is correct SR3E behaviour.
