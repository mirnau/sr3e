# TECHSPEC: Rigger Actions Menu

## Context

Continuation of `.zone/techspecs/TECHSPEC-vehicle-rigger.md` (shipped in commit `166fb23`), which deferred Maneuver Score, Combat Actions, Resistance Tests, Sensor-Enhanced Gunnery, and the rigger initiative bonus as WON'T. This spec covers a deliberately minimal slice of that backlog: a menu of buttons that open the roll composer pre-filled correctly for each named SR3 rigger test, plus the passive Reaction/Initiative bonus while jacked in. No new resolution/automation logic (no success-multiplication, no chained sensor-lock-then-fire, no automated damage or crash outcomes) — this explicitly stops at "prepare the advanced roll."

Grounding facts (see prior techspec and this session's research):
- `ProcedureSetup` already has `openRoll`/`openTest` flags (used by `buildDicePoolSetup`) that skip target-number comparison entirely (`SR3ERoll.buildOpen` rolls `Nd6x` with no TN) — reused as-is for Open Tests. No "highest single die" extraction exists or is being added; the exploding-dice pool display is sufficient, matching this project's "no automated enforcement" pattern (condition-monitor stages, etc.).
- No initiative/turn-order system needs touching. `SR3EActor.rollInitiative()` (`module/documents/SR3EActor.ts`) already computes `dice = initiative.value + initiative.mod` d6 plus a flat `reaction.value + reaction.mod` bonus — an ActiveEffect on `system.attributes.reaction.mod` and `system.attributes.initiative.mod` flows through this unmodified.
- The already-shipped Driving Test TN formula (`GarageVehicleSheet.svelte`'s `onDrivingRoll`) and Control-Pool-capping plumbing (`ProcedureSetup.poolAvailableOverrides`, `module/services/combat/procedures/composerService.svelte.ts`, `RollComposerComponent.svelte`) are reused, not rebuilt.
- Dodge and Damage Resistance are explicitly out of scope this phase (not "interesting right now" per direction) — deferred again.

---

## Design Decisions

| Decision | Outcome |
|---|---|
| Roll grouping | **Driving-Test family** (Vehicle Skill vs Handling, TN − VCR level, Control Pool capped at skill rating): Accelerating/Braking, Positioning, Ramming, Crash Test — mechanically identical to the already-shipped Standard Driving Test, differing only in button label. **Open-Test family** (Vehicle Skill dice, no TN, Control Pool capped at skill rating): Maneuver Score (Driver Points), Hiding. |
| Sensor Test | New family: dice = vehicle's `sensor.value` SimpleStat (no character skill involved), TN 4 default (player/GM adjusts by fiction in the composer, same as they would for range/stealth mods today). No Control Pool cap (Sensor Rating isn't a skill). |
| Sensor-Enhanced Gunnery | dice = chosen active skill's rating + `floor(sensor.value / 2)`, TN 4 − VCR level (jacked-in gated), Control Pool capped at the base skill rating (same convention as Manual Gunnery). Ad-hoc skill dropdown, same pattern as the existing weapon cards — no specific mounted weapon selection this phase (no damage automation to tie it to). |
| Always advanced | Every new rigger-action button always calls `openComposer` — never the target-count-conditional `executeProcedure` shortcut the Driving Test/weapon cards use. Matches direction: these are "advanced roll" preparations, not instant rolls. |
| Reaction/Initiative bonus | ActiveEffect on the character, created when `jackedIn` flips true and deleted when it flips false — mirrors the existing VCR essence-cost effect pattern (`vehicleControlRigEssence.ts`). Two changes: `system.attributes.reaction.mod` +2 (add), `system.attributes.initiative.mod` +VCR level (add). Synced via a Svelte `$effect` watching `entry.jackedIn`/`entry.vcrId` in `GarageVehicleSheet.svelte`, not just the toggle's click handler — this also covers the auto-jack-out-on-unseat path (`Garage.svelte`'s `setSeated`), which flips `jackedIn` without going through the manual toggle handler. Effect is found by a `flags.sr3e.riggerJackInBonus` marker; re-synced (deleted+recreated) if the VCR level changes while jacked in, no-op if unchanged. |
| Placement | New `GarageRiggerActionsCard.svelte`, a separate `SheetCard` in `GarageVehicleSheet.svelte`'s grid, shown only when `entry.jackedIn` is true — keeps the always-visible Actions card (Driving Test + weapon cards) uncluttered for non-riggers. |
| Skill selection | One ad-hoc active-skill dropdown for the Vehicle-Skill-based buttons (Maneuver Score, Accelerate/Brake, Position, Ram, Hide, Crash Test — six buttons share one dropdown), one separate ad-hoc dropdown for Sensor-Enhanced Gunnery's skill. Sensor Test has no dropdown (vehicle stat only). |
| Dodge / Damage Resistance | WON'T this phase — explicitly deferred again. |

---

## MoSCoW

### MUST

1. `syncRiggerBonusEffect(actor, jackedIn, vcrLevel)` in `module/services/effects/riggerBonusEffect.ts` — finds/creates/updates/deletes the ActiveEffect per the Design Decisions table.
2. Wire a `$effect` in `GarageVehicleSheet.svelte` calling `syncRiggerBonusEffect` reactively off `entry.jackedIn`/selected VCR level.
3. `buildVehicleDrivingTestSetup(character, vehicle, skillId, handlingTN, vcr, title)` in `module/services/combat/procedures/vehicleDrivingTest.ts` — extracted/generalized from the existing `onDrivingRoll` inline logic, parameterized by title so Accelerate/Brake/Position/Ram/Crash Test can reuse it.
4. `buildVehicleOpenTestSetup(character, skillId, vcr, title)` in the same file — Vehicle Skill dice, `openRoll`/`openTest: true`, Control-Pool-capped, no TN. Used for Maneuver Score and Hiding.
5. `buildSensorTestSetup(vehicle, title)` — dice from `vehicle.system.sensor.value`, TN 4, no pool cap.
6. `buildSensorEnhancedGunnerySetup(character, vehicle, skillId, vcr, title)` — dice = skill rating + `floor(sensor/2)`, TN 4 − VCR level, Control-Pool-capped at skill rating.
7. New `GarageRiggerActionsCard.svelte`: two skill dropdowns (Vehicle Skill, Gunnery Skill) + six Driving/Open-Test buttons + one Sensor Test button + one Sensor-Enhanced Gunnery button, all calling `openComposer` directly (never `executeProcedure`).
8. Render the new card in `GarageVehicleSheet.svelte`'s `PackeryGrid`, gated on `entry.jackedIn`.

### WON'T (this phase)

- Any automated resolution: success-multiplication for Accelerate/Brake, net-successes carryover for Positioning, collision-damage reduction for Ramming, crash outcome application, "highest single die" extraction for Driver Points.
- Sensor lock-then-fire chaining (Sensor Test and Sensor-Enhanced Gunnery are independent buttons, not a linked sequence).
- Dodge Test, Damage Resistance (impact/collision, weapons) — vehicle-as-defender contested flows are unbuilt and out of scope.
- Per-weapon tie-in for Sensor-Enhanced Gunnery (no weapon selection, no damage automation).

---

## Affected Files

| File | Change |
|---|---|
| `module/services/effects/riggerBonusEffect.ts` | New — `syncRiggerBonusEffect` |
| `module/services/combat/procedures/vehicleDrivingTest.ts` | New — `buildVehicleDrivingTestSetup`, `buildVehicleOpenTestSetup`, `buildSensorTestSetup`, `buildSensorEnhancedGunnerySetup` |
| `module/ui/actors/actor-components/GarageRiggerActionsCard.svelte` | New |
| `module/ui/actors/actor-components/GarageVehicleSheet.svelte` | Wire the sync effect; render the new card; refactor `onDrivingRoll` to call the extracted builder |
| `lang/config/InventoryConfig.ts`, `lang/en.json` | New keys for the action button labels |
