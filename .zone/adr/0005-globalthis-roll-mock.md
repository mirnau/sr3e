# ADR-0005: Tests mock globalThis.Roll — no injectable evaluator

## Status
Accepted (supersedes ADR-0001)

## Context
ADR-0001 added an injectable `evaluator` parameter to `SR3ERoll.evaluate()` and a `fromTerms` test factory so vitest could control dice outcomes without Foundry globals. This leaked test infrastructure into production: `evaluator` threaded through `executeProcedure`, `resistanceFlow`, and every flow function signature.

User constraint: "tests are for you only and should not sully the production code."

## Decision
Remove `fromTerms` and the `evaluator` parameter entirely from production code. Instead, tests assign a `MockRoll` class to `globalThis.Roll` before each test that needs controlled dice:

```ts
class MockRoll {
    terms = [{ results: [{ result: 5, active: true }] }];
    async evaluate() { return this; }
}
(globalThis as Record<string, unknown>).Roll = MockRoll;
```

`SR3ERoll.evaluate()` calls `new Roll(...)` unconditionally. In vitest, `Roll` resolves from `globalThis`; in Foundry, it resolves from the module scope. No production branching.

## Consequences
- Production API is clean: `build(pool, tn)`, `buildOpen(pool)`, `evaluate()`, no test parameters.
- `sr3eDiceEngine.ts` is still directly testable via `vi.spyOn(Math, "random")` — its pure accumulation loop has no Foundry dependency.
- Tests are slightly more verbose (mock setup per file) but completely decoupled from production shape.
