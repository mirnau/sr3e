# TECHSPEC: Vehicle Rigger — Seated/Jacked-In Garage Flow

## Context

Continuation of `.zone/techspecs/TECHSPEC-vehicle.md`, which shipped the Garage tab (drag-drop UUID linking, compact `GarageVehicleCard` with a driving-roll button) and deliberately deferred all rigger mechanics as WON'T items. This spec resolves that deferral.

Since that spec was written, the codebase moved further than its WON'T list assumed:

- **Mount-to-weapon wiring already exists.** `inventoryMode.ts` + `InventoryCard.svelte` already let a `mechanical` actor own weapon items flagged `isHardpoint`/`isFirmpoint` (vehicle-mode equivalents of `isFavorite`/`isEquipped`), with capacity enforcement against `MechanicalModel.mounts` via `mountUsage()`. This is **not** new work for this spec — it's reused as-is.
- **VCR is a dedicated item type**, not the `TechInterfaceModel.rigger` sub-schema the old spec described: `module/models/items/VehicleControlRigModel.ts`, type `vehiclecontrolrig`, schema `{ level: 1-3, essenceCost, journalId, portability, commodity }`. Lives in the character's normal Inventory tab.
- **A Control Pool already exists** (`system.dicePools.control`, `{value, mod, spent}`) with UI in `DicePools.svelte` and full support in the roll composer (`poolDice` is a first-class `ProcedureSetup`/`rollState` field, `RollComposerComponent.svelte` already steps `poolDice` up to a `poolAvailable` cap). No pool-restriction-by-roll-type exists anywhere — this spec introduces the first one (Control Pool capped at skill rating, computed per-setup).
- **No combat-tracker-state plumbing exists anywhere** in the roll pipeline (nothing reads `game.combat`). This spec does not introduce it either — see Design Decisions.
- Weapon firing resolves the acting skill via `resolveLinkedSkill(actor, item.system.linkedSkillId)`, i.e. `actor.items.get(id)`. A vehicle-owned weapon's `linkedSkillId` can never resolve against a seated character (the vehicle owns no skill items) — this spec bypasses `linkedSkillId` for vehicle-mounted weapons entirely, using an ad-hoc skill dropdown, same pattern as the existing driving-roll dropdown in `GarageVehicleCard.svelte`.

This spec deliberately implements only two of the five SR3 rigger roll types (Standard Driving Test, manual Gunnery) — Maneuver Score/Driver Points, Combat Actions (accelerate/brake/position/ram), Resistance Tests, and Sensor-Enhanced Gunnery are out of scope, left for a future phase (see WON'T), matching this project's precedent of phasing dense rule sets (Magic Levels 1-5 in PLAN.md).

---

## Design Decisions

| Decision | Outcome |
|---|---|
| Garage data shape | `CharacterModel.garage` changes from `ArrayField<StringField>` (UUID list) to `ArrayField<EmbeddedDataField<GarageEntryModel>>`, each entry `{ uuid: string, seated: boolean, vcrId: string, jackedIn: boolean }`. No migration — project has no migration infra (`.zone` precedent, no `migrations/` folder); dev data resets are acceptable. |
| Garage tab view mode | The whole Garage tab is either "grid" (no entry seated: render all `GarageVehicleCard`s as today) or "single sheet" (exactly one entry seated: render only that entry's expanded card, full width, others hidden). Toggling seated=true on entry B while entry A is seated sets A's seated back to false — enforced in the toggle handler, not just by UI hiding, so the underlying data never holds two seated=true entries for one character. |
| Weapon-card scope | Only weapons flagged `isHardpoint`/`isFirmpoint` on the vehicle actor (existing `mountUsage`/`INVENTORY_PRIMARY_FLAG.vehicle` flags) appear as weapon cards in the expanded garage view. Unmounted vehicle inventory is not shown here — it's cargo, not operable. |
| Weapon-card component | Reuse `InventoryCard`'s weapon sub-display (`WeaponComponent.svelte`) for the ammo/mode readout, but build a **new** slim card wrapper (not the full `InventoryCard`, which is drag/equip/personal-inventory-oriented) that swaps in the ad-hoc skill dropdown described below instead of `linkedSkillId`, and calls the new `buildVehicleWeaponAttack` setup builder. |
| Firing skill resolution | Bypass `item.system.linkedSkillId` for vehicle-mounted weapons. Each weapon card gets its own `<select>` of the seated character's active skills (same derivation as the existing driving dropdown: `items.filter(i => i.type === "skill" && i.system.skillType === "active")`), defaulting to the first one. Selection is transient component `$state`, not persisted — matches the existing driving-roll dropdown's behavior. |
| VCR selection | If the character owns ≥1 `vehiclecontrolrig` item, show a dropdown of them by name. Defaults to the highest `level` owned. The chosen `vcrId` persists on the garage entry (survives reload), same field the player can change any time. If the character owns none, no dropdown, no jacked-in toggle — plain passenger/driver only. |
| Jacked-in gating | The "jacked in" boolean toggle only renders when `seated && ownsAtLeastOneVCR`. Toggling it off (or un-seating) always reverts to plain-skill rolls. |
| Control Pool visibility | The Control Pool stat card only appears in the expanded garage view when `seated && jackedIn` — reuses the existing `dicePools.control` value/store, no new pool. |
| Driving Test TN | `TN = handling (or handlingRoad/handlingOffRoad per vehicleType) − (jackedIn ? selectedVCR.level : 0)`, floor at a sane minimum (reuse whatever floor convention `handlingTN` derivation already implies, i.e. don't go below the existing rounding behavior — no explicit floor found elsewhere, so clamp at TN 2 as the system's general minimum-TN convention). No combat/non-combat doubling — always the single (non-combat) reduction this pass; combat-state detection is new infrastructure this codebase doesn't have yet and is deferred. |
| Gunnery TN | Manual Gunnery only (no Sensor-Enhanced two-step): base TN 4, plus existing `rangeModifier`/`resolveRange` treatment already used by `buildFirearmSetup` (reused as-is), minus `jackedIn ? selectedVCR.level : 0`. |
| Control Pool dice cap when jacked in | For both Driving and Gunnery rolls while jacked in, the pool dice offered for "control" in the composer are capped at the acting skill's rating (`skill.system.activeSkill.value`), not the full `dicePools.control` available value. Implemented by having the new setup builders compute an effective `controlPoolAvailable = min(actualControlAvailable, skillRating)` and pass it through the `ProcedureSetup` for the composer to use as `poolAvailable` for the control option — new plumbing, since no existing roll restricts pool availability below the raw stat. |
| Rigger Initiative bonus (+2 Reaction, +1D6/VCR level while rigging) | **WON'T** this pass — initiative dice/attribute modification while jacked in is a separate cross-cutting concern (touches the initiative/turn-order system, not the Garage tab) and is deferred alongside Maneuver Score. |
| Maneuver Score / Driver Points / Combat Actions (accel, brake, position, ram) / Resistance Tests / Sensor-Enhanced Gunnery | **WON'T** this pass. Future phase, own TECHSPEC, once this plumbing (seated/jacked-in/VCR selection/weapon cards) exists to build on. |
| `MechanicalModel.riggerAdaptation`/`remoteControlInterface` | Not read or gated on by this feature. They stay unused fields; whether they should restrict jacked-in eligibility (e.g. require `remoteControlInterface`) is left for the future phase to decide once the base flow is proven. |

---

## MoSCoW

### MUST

1. Convert `CharacterModel.garage` from `ArrayField<StringField>` to `ArrayField<EmbeddedDataField<GarageEntryModel>>` with fields `uuid`, `seated` (bool, default false), `vcrId` (string, default ""), `jackedIn` (bool, default false). New `GarageEntryModel` in `module/models/actors/actor-components/` (or co-located with `CharacterModel`, matching existing sub-model placement convention).
2. Update `Garage.svelte`'s drop handler to append `{ uuid: dropped.uuid, seated: false, vcrId: "", jackedIn: false }` instead of a bare string; update dedupe check to compare `entry.uuid`.
3. Garage tab view-mode switch: grid view (all `GarageVehicleCard`s) when no entry has `seated === true`; single expanded view for the one seated entry otherwise. Toggling seated=true on any entry sets `seated=false` on every other entry for that character in the same update.
4. Add the seated toggle to the compact (grid) card — a boolean toggle, visually consistent with `FilterToggle` (letter-badge style, matching the existing hardpoint/firmpoint "H"/"F" toggles) or `LabeledBoolean` (labeled switch row) — pick whichever the expanded-card layout reads better with.
5. Build the expanded single-vehicle view (new component, e.g. `GarageVehicleSheet.svelte`) shown when seated: retains the existing compact stats + condition monitor, adds:
   - VCR dropdown (only if character owns ≥1 `vehiclecontrolrig` item), defaulting to highest `level`, persisting `vcrId` on the garage entry.
   - Jacked-in toggle (only rendered if a VCR is selectable).
   - Control Pool display (only when `seated && jackedIn`), reusing `dicePools.control` stores same as `DicePools.svelte`.
   - Driving-roll control (existing skill dropdown + roll button, ported from `GarageVehicleCard`), TN per the Driving Test formula above.
   - One weapon card per hardpoint/firmpoint-flagged weapon on the vehicle, each with its own ad-hoc active-skill dropdown and a Gunnery roll button, TN per the Gunnery formula above.
6. `buildVehicleDrivingAttack`-equivalent: extend/wrap the existing driving-roll setup (`buildSkillSetup` call in `GarageVehicleCard.svelte`) to apply the VCR TN reduction and the capped control-pool-dice plumbing when jacked in.
7. New `buildVehicleWeaponAttack(character, vehicleWeaponItem, chosenSkillId, jackedIn, vcrLevel)` in `module/services/combat/procedures/` — parallels `buildWeaponAttack` but resolves the skill from the explicit `chosenSkillId` param instead of `item.system.linkedSkillId`, applies base TN 4 + range modifiers − VCR reduction, and the same capped-control-pool plumbing.
8. Composer/`ProcedureSetup` plumbing to carry an effective capped `poolAvailable` for the "control" pool option on these two roll types (new field on `ProcedureSetup`, consumed by `RollComposerComponent.svelte` when populating pool options — currently pool availability always equals the raw actor stat).
9. Non-seated garage entries hide all of the above — only name, condition monitor, and compact stats show, no roll controls (driving roll moves from "always visible" to "seated only").

### SHOULD

10. Un-seating (toggling seated back to false) from the expanded view returns to grid mode without an extra confirmation step.
11. Weapon-card list within the expanded view reuses `VehicleConditionMonitor`-style consistent layout/spacing with the rest of the expanded card, not a raw dump of `InventoryCard`s.

### COULD

12. Visual indicator on the compact grid card for which vehicles already have another seat occupied by other characters (would require reading other actors' garage arrays — cross-actor query, not attempted this pass).

### WON'T (this feature)

- Maneuver Score / Driver Points (Open Test, highest-die result) and its Control Pool allocation.
- Combat Actions: Accelerating/Braking test, Positioning test, Ramming test.
- Resistance Tests: Crash Test, Damage Resistance (impact/collision, weapons) using Body + Control Pool.
- Sensor-Enhanced Gunnery (Sensor Test lock-on + Gunnery Test at Skill + ½ Sensor).
- Rigger Initiative bonus (+2 Reaction, +1D6/VCR level) while jacked in.
- Combat-tracker-state-aware TN doubling (Handling − 2×VCR "in combat").
- Cross-character seat-occupancy awareness/locking.
- Any gating on `MechanicalModel.riggerAdaptation`/`remoteControlInterface`.

---

## Affected Files

| File | Change |
|---|---|
| `module/models/actors/CharacterModel.ts` | `garage` field: `ArrayField<StringField>` → `ArrayField<EmbeddedDataField<GarageEntryModel>>` |
| `module/models/actors/actor-components/GarageEntryModel.ts` | New — `{ uuid, seated, vcrId, jackedIn }` |
| `module/ui/actors/actor-components/Garage.svelte` | Object-shaped entries; view-mode switch (grid vs. single expanded) |
| `module/ui/actors/actor-components/GarageVehicleCard.svelte` | Becomes the "grid" compact card; add seated toggle; remove driving-roll controls (moved to expanded view) |
| `module/ui/actors/actor-components/GarageVehicleSheet.svelte` | New — expanded single-vehicle view: VCR dropdown, jacked-in toggle, control pool, driving roll, weapon cards |
| `module/ui/actors/actor-components/GarageWeaponCard.svelte` | New — slim weapon card: ad-hoc skill dropdown + Gunnery roll button |
| `module/services/combat/procedures/vehicleWeaponAttack.ts` | New — `buildVehicleWeaponAttack`, parallels `buildWeaponAttack` without `linkedSkillId` dependency |
| `module/services/combat/procedures/simpleSetups.ts` (or wherever `buildSkillSetup` lives) | Extend to accept VCR TN reduction + capped control-pool params for the driving roll |
| `module/ui/combat/RollComposerComponent.svelte` | Consume an optional per-setup capped `poolAvailable` override for the control pool option |
| `module/services/combat/procedures/simpleSetups.ts` types / `ProcedureSetup` | Add optional `poolAvailableOverrides` (or similar) field |
| `lang/config/InventoryConfig.ts`, `lang/en.json` | New keys: seated toggle label, jacked-in label, VCR dropdown label, gunnery-roll button label |

---

## Critical Invariants

- Garage entries never hold more than one `seated: true` per character — enforced at the toggle-handler level, not just by hiding UI.
- Weapon cards only ever reflect `isHardpoint`/`isFirmpoint`-flagged vehicle weapons — reuses `mountUsage`/`INVENTORY_PRIMARY_FLAG.vehicle`/`INVENTORY_SECONDARY_FLAG.vehicle` from `inventoryMode.ts` verbatim, no parallel mount-tracking concept introduced.
- `linkedSkillId` on vehicle-owned weapons is never read by this feature's roll paths — the ad-hoc dropdown is the only skill source for vehicle-mounted weapon fire control by a seated character.
- Control Pool dice availability for these two roll types must never exceed `min(dicePools.control available, skill rating)` — the cap is computed in the setup builder, not left to composer-side manual restraint.
