# ADR-0003: executeProcedure as single guarded entry point for all combat rolls

## Status
Accepted

## Context
Multiple code paths can trigger rolls (melee, ranged, skill checks, defense). Without a single entry point, lock management, full-defense checks, and formula construction would be duplicated or inconsistently applied.

## Decision
`executeProcedure(setup, actor, opts)` is the sole public interface for executing any combat procedure. It:
1. Checks the full-defense flag before acquiring any lock.
2. Acquires `procedureLock` with the setup's priority.
3. Builds the dice formula from `RollState` and evaluates via `SR3ERoll`.
4. Branches to `executeSimpleFlow` (no targets or no defenseHint) or `executeContestedFlow`.
5. Releases the lock in a `finally` block regardless of outcome.

Setup objects (`ProcedureSetup`) are constructed by family-specific builders (firearmSetup, meleeSetup, etc.) and passed in — `executeProcedure` knows nothing about weapon families.

## Consequences
- Lock, full-defense gate, and formula logic live in one place.
- Family builders are pure data constructors — no side effects.
- Injectable evaluator in opts enables end-to-end testing without Foundry.
