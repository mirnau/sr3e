## System Context
## Architecture
## Key Dependencies
## Critical Exceptions

### Cyberdeck/VCR Essence cost is baked in on `createItem`, not gated on jack-in state
`registerItemEssenceEffectHook` (`module/foundry/itemEssenceEffect.ts`) is the shared implementation behind both `registerVehicleControlRigEssenceHook` and `registerCyberdeckEssenceHook` — it fires on `createItem`, only once the item is actually embedded on an `Actor` (not a bare sidebar item), and bakes a permanent `-essenceCost` `ActiveEffect` (`system.attributes.essence.mod`) onto the owning character. This is **not** tied to `jackedIn` — Essence cost represents surgically installed cyberware (cranial cyberdeck jack, VCR chip), paid once at installation, independent of whether the character is actively jacked in at any given moment. Do not move this into the jack-in toggle handler.

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

### PC tokens must stay linked (`actorLink: true`) — unlinked edits silently diverge and never reach chat-driven flows

An unlinked token gets its own synthetic actor (`token.delta`) with a genuinely separate Items collection, cloned from the canonical actor at token-creation time and then diverging independently. Editing a PC's sheet via an unlinked token (adding/editing spells, attributes, anything) writes only to that per-token copy — `game.actors.get(id)` and every chat-driven flow (rolls, drain, contests) read the canonical actor and never see those edits, and there is no reconciliation back. This produced real symptoms in live testing: duplicate spell items with divergent data (e.g. two copies of the same spell with different drain levels), and a stray +6 drain modifier traced to data that only existed on the token's synthetic actor. Re-linking (remove token, confirm `actorLink: true`, re-add) resets the token to the canonical actor's real data and resolves it, but any edits made while unlinked are lost, not merged. This is not a bug in this codebase to guard against — it's inherent to Foundry's linked/unlinked actor model — but mid-combat sheet editing on a PC token should never be treated as a supported workflow, since Foundry gives no visible warning when a token silently isn't linked.

### sellerMutationRelay's item-existence check before delete is not redundant

`deleteSellerItem` in `sellerMutationRelay.ts` checks `seller.items.get(itemId)` before calling `deleteEmbeddedDocuments`. This looks like it could be trimmed to just the delete call, but it can't: if two GM sessions are connected, both receive the same broadcasted `purchaseSellerDelete` socket payload and both attempt the delete — the second one targets a document the first already removed, which Foundry rejects with an uncaught "does not exist" error instead of a no-op. This existence check is what makes the operation idempotent under that real double-GM-session scenario (confirmed live).

### debtInterest's GM-only gate on updateWorldTime is required, not optional

`registerDebtInterestHook` in `debtInterest.ts` gates its entire body on `currentUserIsGM()`. `updateWorldTime` fires on every connected client, and the hook iterates every actor's debts and writes to them directly — without the gate, non-GM clients throw permission errors writing to actors they don't own, and a debt visible to both its owner and the GM risks having interest compounded twice in the same month rollover. Do not remove this gate to "let every client keep things in sync" — only the GM's client may perform this bulk write.

### contestedFlow.test.ts's `game.actors` mock is load-bearing, not incidental

The test's `game` mock resolves target actors via a `game.actors.get` backed by an `actorsById` map that `makeTarget()` populates. This exists because `handleContestStub` (defenderFlow.ts) calls `resolveActor(stub.target.actorId)` via `game.actors.get`, and without a real actor to resolve, it calls `expireContest`, which aborts the contest before it ever reaches `ChatMessage.create`. This used to pass anyway only because of the exact missed-wakeup bug ADR-0011 fixes — the premature abort signal arrived before `waitForResponse` had registered its listener and was silently dropped, so the test's own later `deliverResponse` call "won" instead. Do not remove the `game.actors` mock as unnecessary boilerplate; without it, every contest in this test file will abort for real again.

### Matrix Initiative replaces standard Initiative via a full formula override in `rollInitiative`, not an ActiveEffect bonus like the VCR rigger pattern
Earlier design took the pasted SR3 ruleset's `Reaction (Persona) + [1 + Response Increase]D6` at face value and concluded jacking in should have zero mechanical effect on the actor's real Initiative (superseded — see below). The corrected, user-specified formula is Intelligence-based: `[Intelligence + (2 x Response Increase)] + [1 + Response Increase]D6`, and it **fully replaces** the character's standard Initiative roll while jacked in — not an additive bonus layered on top like `riggerBonusEffect.ts` (which grants +2 Reaction/+1D6-per-VCR-level via `ActiveEffect` while the real Reaction/Initiative stats still apply underneath).

Implementation: `SR3EActor.rollInitiative()` delegates to `resolveInitiativeFormula(actor)` (`module/services/effects/matrixInitiativeFormula.ts`), which checks `findJackedInCyberdeck(actor)` and returns either `matrixInitiativeFormula` (Intelligence + 2xResponseIncrease base, `1+ResponseIncrease`D6) or `standardInitiativeFormula` (the original Reaction+mod / Initiative.value+mod computation) — no `ActiveEffect` involved, no `.mod` field written. If an actor is somehow both rigger-jacked-in and cyberdeck-jacked-in simultaneously, Matrix Initiative wins outright (the rigger's `reaction.mod`/`initiative.mod` bonuses are simply not read in that branch) — this hasn't been asked about and is an unhandled edge case, not a deliberate design choice.

`computeMatrixReaction` (the old Reaction-based, display-only formula in `cyberdeckCalculations.ts`) was deleted — it's superseded by `matrixInitiativeFormula.ts`'s Intelligence-based formula and was never anything but a stale display value. Hacking Pool and Matrix Initiative are no longer displayed anywhere on the cyberdeck item sheet or the Matrix tab's stats panel — Hacking Pool already shows on the character sheet's Dice Pools row once jacked in (see the `hasHackerInterface` critical exception above), and Matrix Initiative only matters at the moment of an actual Initiative roll now, not as a static readout.

### Matrix Program is its own Item type, not embedded on the cyberdeck — deck and program are decoupled inventory items
Matrix Programs are a standalone Foundry item type (`matrixprogram`, `MatrixProgramModel`: just `tnModifier` + the usual `journalId`/`portability`/`commodity`) owned directly by the character, exactly like weapons/gadgets/wearables — **not** an embedded array on `CyberdeckModel`. This was tried once as `CyberdeckModel.programs` (a flat `{name, tnModifier}[]`) and deliberately reverted: Matrix Programs are TN modifiers on specific System Tests per SR3 p.220-222, conceptually independent of any particular deck, and the codebase's convention is that cross-cutting concepts get their own item type rather than living embedded inside another item's schema (see gadgets, foci). `CyberdeckModel` carries no program-related field at all.

Nothing in the ActiveEffect/gadget system can reach a roll's TN modifier list (gadgets only reach `ActiveEffect.changes` keys like `system.attributes.x.mod`, a different layer than TN mods), so programs are surfaced as clickable cards in `MatrixProgramCard.svelte` (rendered directly in the Matrix tab, independent of any jacked-in deck). Clicking one while the advanced composer is open toggles a `Modifier` into `composerState.programModifiers` (`composerService.svelte.ts`, keyed `program-<itemId>`), which `RollComposerComponent.svelte` merges into its TN Modifiers list (marked read-only there, like the defaulting modifier — removed only by re-clicking the card, not the composer's own X button). Do not try to route Matrix Program effects through ActiveEffects; the TN modifier concept doesn't have a hook there. Do not re-embed programs onto `CyberdeckModel` — the Matrix tab (`Register.svelte`'s `hasMatrixTab` gate) is deliberately visible whenever a character owns either a cyberdeck or a Matrix Program, independently.

### Sleaze is a dedicated capped field, not a Program or Utility
Sleaze (SR3 p.207, p.221) only ever feeds Detection Factor (`(Masking + Sleaze) / 2`) — it's never itself a roll or a TN modifier, so it isn't a Matrix Program. It lives as `CyberdeckModel.sleazeRating` (capped at MPCP like the four Persona Programs, but tracked separately — it doesn't count toward the `MPCP x 3` Persona sum). `computeDetectionFactor(masking, sleazeRating, mpcp)` reads it directly; there is no more name-matching against a utilities list.

### Cyberdeck Memory tracking has no "used" computation anymore
`CyberdeckModel.memory.{active,storage}.max` are still manually-set capacity fields, but `.value` ("used") is no longer auto-computed — it depended on summing utility `size` fields, and Matrix Programs (their replacement) don't carry a size cost. If Active/Storage Memory budgeting needs to come back, it has to be re-derived from whatever replaces "installed software," not bolted onto the TN-modifier-only Programs array.

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
- [0010-cross-client-actor-mutation-relay](adr/0010-cross-client-actor-mutation-relay.md) — Cross-actor economy writes relay through the GM's client; trades require consent from whoever isn't dragging
- [0011-contest-signal-caching-prevents-stuck-locks](adr/0011-contest-signal-caching-prevents-stuck-locks.md) — waitForResponse/waitForBothDone cache an early signal instead of only resolving a currently-registered listener
