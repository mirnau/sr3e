# ADR-0001: SR3ERoll injectable evaluator for testability

## Status
Superseded by [ADR-0005](0005-globalthis-roll-mock.md)

## Context
SR3ERoll wraps Foundry's dice engine, which is unavailable in vitest (node environment, no Foundry globals). We needed to unit-test countSuccesses, isGlitch, and toSnapshot without mocking the entire Foundry runtime.

## Decision
SR3ERoll exposes two factories:
- `SR3ERoll.build(pool, tn)` — production path, uses Foundry's `Roll` internally
- `SR3ERoll.fromTerms(terms, tn)` — test path, constructs directly from a DieTerm array

`evaluate()` accepts an optional `evaluator` parameter `(formula, opts) => Promise<DieTerm[]>`. When provided it bypasses the Foundry `Roll` entirely.

## Consequences
- All roll logic is testable without Foundry globals.
- `executeProcedure` and flow functions thread the evaluator through so integration tests can control dice outcomes.
- Production callers pass no evaluator; Foundry's engine is used as normal.

## Superseded by
ADR-0005 removed `fromTerms` and the injectable evaluator entirely. Tests now mock `globalThis.Roll` instead.
