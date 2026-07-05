# Strip Data-Migration Code

## Context

Project is alpha: no live players, no persisted player-owned worlds to protect. `CONTRIBUTING.md:207` already states the convention: "Migrations (only in beta & release)." Five `TypeDataModel`/`DataModel` classes currently carry a `static migrateData()` override with real old-shape→new-shape conversion logic, none of it exercised by the test suite (verified: no test constructs documents through these model classes with old-shaped `system` data — existing fixtures are plain mocks already using current field names).

## Design Decisions

| Decision | Outcome |
|---|---|
| Scope of "dead" | All 5 found `migrateData` overrides are real conversion logic (not stubs) and none are used by tests → all removed, per user directive. |
| Replacement | Delete the method entirely (no empty override left behind) — the base `TypeDataModel.migrateData` no-op is inherited automatically. |
| Dev-world fallout | Any of the developer's own already-persisted test-world Actors/Items with old-shaped data will show broken/`undefined` fields after this change until manually recreated. Accepted risk per user (alpha, cheap to recreate). |

## MoSCoW

### MUST

1. Remove `static migrateData()` from `module/models/items/WeaponModel.ts` (damage/range/recoilComp → `ModifiableNumber` coercion).
2. Remove `static migrateData()` from `module/models/items/AmmunitionModel.ts` (`class` → `ammunitionClass` rename).
3. Remove `static migrateData()` from `module/models/actors/MechanicalModel.ts` (`speed`→`currentSpeed`, `speedMax`→`maxSpeed` rename), including its preceding explanatory comment block if it only exists to justify the migration.
4. Remove `static migrateData()` from `module/models/actors/CharacterModel.ts` (garage entry string→object upgrade), including its preceding explanatory comment block if it only exists to justify the migration.
5. Remove `static migrateData()` from `module/models/items/item-components/RangeBand.ts` (short/medium/long/extreme → `ModifiableNumber` coercion).
6. Run the full test suite and typecheck after removal to confirm nothing depended on the coerced shapes.

### SHOULD

- None.

### COULD

- None.

### WON'T (this pass)

- No regression tests added — this removes dead code, not behavior under test.
- No data backfill/migration script for the developer's own dev-world documents — recreate affected items manually if needed.
