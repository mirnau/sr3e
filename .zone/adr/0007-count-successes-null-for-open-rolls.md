# ADR-0007: countSuccesses() returns null for open rolls

## Status
Accepted

## Context
Single-click skill rolls use `SR3ERoll.buildOpen(pool)` — no TN is available at roll time. The question arises: should `countSuccesses()` return 0, throw, or signal "not applicable"?

Returning 0 would be misleading — an open roll with high accumulated results isn't "zero successes", it's "successes unknown without a TN". Throwing would couple callers to exception handling. A null return cleanly encodes "this question has no answer in this context."

## Decision
`SR3ERoll.countSuccesses()` returns `number | null`. Returns null when `tn === null` (open roll). Callers that need a success count must handle null explicitly — typically by skipping automatic success logic and deferring to GM.

`isGlitch()` returns `false` (never true) for open rolls — Rule of One is only meaningful when TN context exists.

## Consequences
- Type signature forces callers to acknowledge the open-roll case; no silent wrong counts.
- `resistanceFlow.ts` uses `countSuccesses() ?? 0` since body resistance always has a TN and open rolls never reach that path.
- Chat/UI rendering of open rolls shows raw accumulated totals, not a success count.
