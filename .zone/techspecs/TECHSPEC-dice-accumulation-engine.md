# TECHSPEC: SR3E Dice Accumulation Engine

## Problem

The current `SR3ERoll` uses Foundry's native `d6x6` exploding dice. Foundry's engine **spawns new pool dice** on each explosion — a chain of 6→4 produces two separate results (6 and 4), not one accumulated result of 10. This is mechanically wrong for SR3E.

SR3E Rule of Six: when a die shows 6, roll again and **add to that die's running total**. Chain continues while the face shows 6 (and total < cap). Each die position reports one final accumulated integer.

The old system solved this with a custom `SR3Edie` class registered at `CONFIG.Dice.terms.d`. We port that to TypeScript.

---

## MoSCoW

### MUST

- **Port `SR3Edie` to TypeScript** — custom Foundry Die subclass, denomination `d`, accumulation loop per die position. Results appear in Foundry's native dice log.
- **Extract pure accumulation function** — `sr3eDiceEngine.ts`, testable without Foundry globals. SR3Edie delegates to it.
- **Register SR3Edie** in `sr3e.ts` inside `Hooks.once(hooks.init, ...)`.
- **`buildFormula(state)`** emits `Nd6x${TN}` — cap = computed final TN. TN always present in `RollState` (null removed from type).
- **`buildInfiniteFormula(pool)`** emits `Nd6x` — uncapped, infinite chain, for single-click skill/spec rolls.
- **`buildInitiativeFormula(pool)`** emits `Nd6` — no explosion modifier, plain sum. Initiative: Rule of Six never applies.
- **`SR3ERoll.buildOpen(pool)`** — new factory, `tn: null` internally. For open (uncapped) rolls.
- **`SR3ERoll.countSuccesses()`** — returns `number | null`. `null` when no TN (open roll); GM interprets.
- **`SR3ERoll.isGlitch()`** — returns `false` when no TN. Rule of One only meaningful in TN context.
- **Remove `fromTerms` and injectable evaluator** from `SR3ERoll` — test pollution. Tests mock `globalThis.Roll` instead.
- **Fix `executeProcedure.ts`** — compute pool directly from `RollState` fields, not by parsing `buildFormula` output.
- **Fix `RollState.targetNumber`** — change `number | null` to `number`. Null state is unreachable through any builder.

### SHOULD

- **`SR3Edie` marks `exploded: true`** on results that chained — matches old system's rendering flag for chat CSS classes (`.explode`, `.max`, `.success`).

### WONT (deferred)

- Chat renderer (`renderRollOutcome` port) — Tier 5 UI.
- Uncapped roll as system setting — captured in IDEAS.md.

---

## Accumulation algorithm

Verbatim port of `SR3Edie._evaluateSync` logic:

```
for each die in pool:
    total = 0
    exploded = false
    loop:
        face = random 1–6
        total += face
        if face === 6 AND total < cap:
            exploded = true
            continue
        else:
            break
    results.push({ result: total, active: true, exploded })
```

Cap encoding in formula:
- `d6x4` → cap = 4 (chain stops once total ≥ 4)
- `d6x` → cap = Infinity (chain until non-6, no ceiling)
- `d6` → no modifier, no explosion

---

## Formula semantics

| Roll type | Formula | Cap | Example use |
|---|---|---|---|
| Combat / advanced | `Nd6x${TN}` | TN | Firearm attack TN=5 → `6d6x5` |
| Open (single click) | `Nd6x` | Infinity | Player clicks Firearms skill |
| Initiative | `Nd6` | — | `3d6` plain sum |

---

## SR3ERoll changes

```ts
class SR3ERoll {
    static build(pool: number, tn: number): SR3ERoll       // unchanged signature
    static buildOpen(pool: number): SR3ERoll               // new — tn: null internally
    async evaluate(): Promise<this>                        // unchanged — calls new Roll(formula)
    countSuccesses(): number | null                        // null when no TN
    isGlitch(): boolean                                    // false when no TN
    toSnapshot(): RollSnapshot                             // unchanged
}
// fromTerms and injectable evaluator REMOVED
```

---

## diceFormula.ts changes

```ts
// CHANGED — was always d6x6
export function buildFormula(state: RollState): string
// returns `${pool}d6x${computeFinalTN(state)}`
// pool = state.dice + computePoolDice(state) + state.karmaDice

// NEW
export function buildInfiniteFormula(pool: number): string
// returns `${pool}d6x`

// NEW
export function buildInitiativeFormula(pool: number): string
// returns `${pool}d6`
```

---

## RollState type change

```ts
// BEFORE
targetNumber: number | null

// AFTER
targetNumber: number   // null is unreachable — no builder produces it
```

---

## File layout

```
module/services/combat/
  diceFormula.ts                  ← add buildInfiniteFormula, buildInitiativeFormula; change buildFormula
  orchestration/
    SR3ERoll.ts                   ← add buildOpen; change countSuccesses/isGlitch; remove fromTerms/evaluator
    sr3eDiceEngine.ts             ← NEW — pure accumulation function
module/foundry/documents/
  SR3Edie.ts                      ← NEW — TypeScript port of SR3Edie.js
sr3e.ts                           ← add SR3Edie.Register() in init hook
```

---

## Registration

```ts
// sr3e.ts — inside Hooks.once(hooks.init, ...)
import SR3Edie from "./module/foundry/documents/SR3Edie";
SR3Edie.Register();
// registers CONFIG.Dice.terms.d = SR3Edie
```

---

## Downstream callsite fixes

- `executeProcedure.ts` — remove `parseInt(formula.split("d")[0])` pattern; compute pool directly: `state.dice + computePoolDice(state, state.poolDice) + state.karmaDice`
- Any test that calls `SR3ERoll.fromTerms(...)` — replace with direct `sr3eDiceEngine` calls or `globalThis.Roll` mock
- Any test that passes injectable evaluator to `evaluate(evaluator)` — same
