## System Context
## Architecture
## Key Dependencies
## Critical Exceptions

### Health track uses `.value`, not `.boxes`
Actor health fields are `system.health.stun.value`, `system.health.physical.value`, `system.health.overflow.value`. There is no `.boxes` field. Any code writing `.boxes` is a bug. Confirmed from Health.svelte store wiring.

### procedureLock priority: advanced=10 blocks simple=1 — not vice versa
`acquireLock` blocks when `currentLock.priority >= incoming.priority`. A held advanced lock (10) blocks all simple rolls (1). A held simple lock (1) does NOT block advanced rolls (10). This asymmetry is intentional — a full combat attack sequence must not be interrupted by a simple skill check.

### SR3Edie registered at CONFIG.Dice.terms["d"] — do not revert to Foundry's Die
`SR3Edie.Register()` writes `CONFIG.Dice.terms["d"] = SR3Edie` at init. This makes our custom accumulation engine the global handler for all `dN` formulas. Foundry's native explode mechanic (`x` modifier spawning extra pool dice) is disabled — we interpret `xN` ourselves in `_evaluate`. Reverting to Foundry's Die breaks Rule of Six: chains would produce separate pool dice instead of a single accumulated result per die position.

### buildFormula cap=TN — the x{TN} IS the stop condition, not the explosion trigger
`buildFormula(state)` produces `${pool}d6x${TN}`. In `SR3Edie._evaluate`, `xN` means "stop accumulating when the running total for that die reaches or exceeds N" — it is not Foundry's "explode when face == N". Do not change the cap to 6, do not separate cap from TN. Three formula types exist for a reason (see ADR-0006): `d6x{TN}` (combat), `d6x` (infinite/single-click), `d6` (initiative). They are not interchangeable.

### SR3ERoll.fromTerms is gone — tests mock globalThis.Roll
`fromTerms` and the injectable `evaluator` parameter were removed from `SR3ERoll` in #125. Tests assign a `MockRoll` to `globalThis.Roll`; production calls `new Roll(...)` unconditionally. Do not re-add `fromTerms` or an evaluator parameter — these are test concerns, not production API shape.

### SR3ERoll.countSuccesses() returns null for open rolls — never coerce to 0
When `SR3ERoll.buildOpen(pool)` is used (no TN), `countSuccesses()` returns `null`. This is intentional: open roll results are raw accumulated totals; GM interprets. Do not default-null to 0 at the SR3ERoll level. The only valid `?? 0` coercion is in `resistanceFlow.ts`, where body resistance always has a TN and open rolls never reach that path.

### GadgetRow.enabled is $derived, not $state — do not revert to untrack snapshot

`enabled` in `GadgetRow.svelte` is `$derived(!!(p.activeEffects[0] as any)?.flags?.sr3e?.gadget?.isEnabled)`. It must track `p.activeEffects[0]` reactively. `ae.update({ render: false })` updates the in-memory document without triggering a sheet re-render, so a one-time `$state` snapshot (via `untrack`) would show stale state until the sheet is fully remounted. The `$derived` re-evaluates whenever `GadgetViewer.refresh()` pushes new `activeEffects` props down. Reverting to `$state` breaks toggle persistence within a session.

### Spell fetish limitation is derived from attached fetish gadgets

Spells are grimoire entries only; do not also render them as inventory assets. A spell is fetish-limited when it has an attached gadget of type `fetish`; do not reintroduce a separate fetish-limited boolean on the spell model. A fetish-limited spell is rollable only when the source fetish gadget remains in inventory and is carried/equipped. Exclusive casting is a casting property, not a limitation boolean.

## ADR Index
- [0001-sr3eroll-injectable-evaluator](adr/0001-sr3eroll-injectable-evaluator.md) — SUPERSEDED: SR3ERoll injectable evaluator (replaced by ADR-0005)
- [0002-dice-formula-always-d6x6](adr/0002-dice-formula-always-d6x6.md) — SUPERSEDED: d6x6 formula (replaced by ADR-0006)
- [0003-execute-procedure-single-entry-point](adr/0003-execute-procedure-single-entry-point.md) — executeProcedure as single guarded entry point for all combat rolls
- [0004-sr3edie-denomination-override](adr/0004-sr3edie-denomination-override.md) — SR3Edie registered as denomination "d"; accumulation engine replaces Foundry's native Die
- [0005-globalthis-roll-mock](adr/0005-globalthis-roll-mock.md) — Tests mock globalThis.Roll; injectable evaluator and fromTerms removed from production
- [0006-dice-formula-cap-equals-tn](adr/0006-dice-formula-cap-equals-tn.md) — buildFormula cap=TN; three formula types (combat, infinite, initiative)
- [0007-count-successes-null-for-open-rolls](adr/0007-count-successes-null-for-open-rolls.md) — countSuccesses() returns null for open rolls; isGlitch() always false without TN
- [0008-gadget-storage-active-effects](adr/0008-gadget-storage-active-effects.md) — Gadgets stored as ActiveEffect docs with flags.sr3e.gadget.*; no embedded item-in-item
- [0009-sustained-spell-drop-via-native-effect-deletion](adr/0009-sustained-spell-drop-via-native-effect-deletion.md) — Sustained-spell drop rides native ActiveEffect deletion + deleteActiveEffect sync hook instead of dedicated drop UI
