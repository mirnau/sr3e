# Migration Progress

## Done

| Phase | Description | Completed |
|-------|-------------|-----------|
| 1 | Character Creation Foundation — priority system, metatype, randomization, initialization | 2025-12-18 |
| 2 | Character Sheet Shopping Mode — creation point distribution, attribute/skill spending | 2026-03-03 |
| 2.1 | Shopping Mode Bug Fixes | 2026-03-15 |
| 2.2 | Health Component Visual Polish | 2026-03-15 |
| 2.3 | Skills Component — tab UI, skill cards, creation-mode spending | 2026-03-08 |
| 2.4 | Buying Mechanics Overhaul — SR3e rules compliance, SkillSpendingService | 2026-03-13 |
| 2.5 | Character Sheet UX Polish — Packery layout, duplicate prevention, linked attr display | 2026-03-15 |
| 3 | Karma & Experience Core — staged karma spending on attributes and skills | 2026-03-13 |
| 3.1 | Svelte Component Debloat — normalized all 38 components to DicePools.svelte pattern | 2026-03-14 |
| 3.2 | Storyteller Screen — KarmaDistributionService, KarmaManager panel | 2026-03-14 |
| 3.3 | Time Manager — TimeService, TimeManager Svelte component | 2026-03-14 |
| 3.4 | GetSimpleStatROStore consolidation — fixed `.modifier` → `.mod` bug in DicePools/Attributes/Movement | 2026-03-16 |

## Next: Combat System Migration

Migration order from old JS, dependency-first:

### Tier 1 — Pure utilities (no inter-system deps)
`SR3EDie` · `ProcedureLock` · `DamageMath` · `ArmorResolver` · `DirectiveRegistry` · `DamagePacket` · `WeaponModePlanners` · `RangeService` · `RecoilTracker` · `AmmoService` · `ActorDataService` · `ItemDataService` · `CombatService`

### Tier 2 — Engine core
`ResistanceEngine` (← DamageMath + ArmorResolver) · `FirearmService` · `MeleeService` · `SR3ERoll` · `OpposeRollService`

> ⚠️ Circular import: `OpposeRollService` ↔ `AbstractProcedure` — must be broken during port.

### Tier 3 — Procedures
`AbstractProcedure` → `AttributeProcedure` · `SkillProcedure` · `DodgeProcedure` · `FirearmProcedure` · `MeleeProcedure` · `MeleeDefenseProcedure` · `ResistanceProcedure` · `ExplosiveProcedure` · `AttributeResponseProcedure` · `SkillResponseProcedure`

### Tier 4 — Orchestration
`ProcedureFactory` · `RollService` · `ComposerAttackController` · `SR3ECombat` · `GadgetEffect`

### Tier 5 — UI
`RollComposerComponent` · `SpellApp` · `MechanicalApp` · `WeaponModApp` · `TransactionApp`

### Independent
`Inventory/AssetManager` — depends only on already-migrated item models + StoreManager, can be done at any point.

## Architecture decisions needed before Tier 1

1. **Circular import OpposeRollService ↔ AbstractProcedure** — extract `IProcedureCallback` interface, DI, event emitter, or deferred resolution
2. **SR3ERoll** — subclass Foundry `Roll` or wrap it? (subclassing has v13 type friction)
3. **AbstractProcedure FSM** — keep class inheritance or convert to composition + strategy pattern?
4. **RollService** — migrate to singleton `Instance()` pattern or keep as Svelte store?
5. **Chat message rendering** — Foundry v13 changed rendering; verify old approach or design new one
6. **GadgetEffect (ActiveEffect subclass)** — verify v13 `ActiveEffect` API before designing gadget system
