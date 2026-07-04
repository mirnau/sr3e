# TECHSPEC: Mechanical (Vehicles, Drones, Aircraft, Watercraft)

## Context

"Mechanical" is the actor type covering everything SR3 calls a vehicle: cars, trucks, bikes, boats, ships, submarines, fixed-wing/rotor/VTOL aircraft, LTA, and drones. Named `mechanical` rather than `vehicle` because a rigid vehicle-only name doesn't fit drones/aircraft/watercraft naturally.

This is not a port from `old_project` — it's a fresh build, and a partial skeleton already exists in this codebase ahead of this TECHSPEC being written:

- `mechanical` is a registered `Actor` type (`sr3e.ts:167-172`).
- `MechanicalModel.ts` has a flat schema matching almost the entire SR3 stat block (handling road/off-road, speed/accel + turbo variants, body, armor, signature, autonav, pilot, sensor, ecm/eccm/flux, cargo, load, seating, entryPoints, mounts as raw counters, commodity, customToken).
- `MechanicalApp.svelte` is a working sheet built with `ItemSheetWrapper csslayout="double"` — the flat two-column item-sheet layout, not the Packery grid the character sheet uses.
- The character sheet already has a "Garage" tab (`registerTabs.ts`, `Register.svelte:150-151`) that is a pure placeholder (`<p>{localize(...)}</p>`).
- A `TechInterfaceModel` item (`cyberdeck` / `rcdeck` / `cyberterminal`) already exists with a `rigger: { rating, fluxRating, subscribers }` sub-schema — this is the VCR/rigger-deck concept, already modeled as an ordinary inventory item.
- The gadget system (see `TECHSPEC-gadget-system.md`) has an extensible `GADGET_TARGETS` registry (`gadgetTargets.ts`) with per-item-type curated `.mod`/override property lists (`weapon`, `wearable`, `fetish`, `medical`). No `mechanical` entry exists yet.

This TECHSPEC scopes the remaining work: retrofit the sheet layout, add gadget-moddable stats, add a condition monitor, and build the Garage-tab vehicle card — while deliberately deferring full rigger control-pool mechanics and mount-to-weapon wiring.

---

## Design Decisions

| Decision | Outcome |
|---|---|
| Actor type / naming | Already `mechanical`. No rename needed. |
| Mounts (firmpoints/hardpoints/turrets/etc.) | Stay as plain numeric capacity counters. No drag-drop weapon linkage, no Body-derived capacity enforcement. Weapon-mount wiring is a WON'T for this feature. |
| Gadget-moddable stats | Convert **every numeric field** on `MechanicalModel` (handling, speed, accel, body, armor, signature, autonav, pilot, sensor, ecm, eccm, flux, cargo, load, speedTurbo, accelTurbo, and mount counters) from plain `NumberField` to `SimpleStat` (`{ value, mod }`), mirroring `HealthModel`/character attributes. Enables "buy a better engine, swap it in" via ordinary gadget effects. |
| Gadget target registration | Add a `mechanical` entry to `GADGET_TARGETS` in `gadgetTargets.ts` with a curated `mechanicalProperties()` list of `.mod` paths (same pattern as `weaponProperties`/`medicalProperties`), not the generic `isModPath` fallback scan. |
| Rigger control / possession | Out of scope (WON'T) for this feature. `TechInterfaceModel` already represents the VCR/rigger-deck as an ordinary inventory item — owning one is the extent of the "rigger" concept for now. No control-pool derivation, no `subscribers` wiring to a Mechanical actor, no jack-in flow. |
| Sheet layout | Replace `ItemSheetWrapper csslayout="double"` with `PackeryGrid` + `SheetCard`-style cards, matching `CharacterSheetApp.svelte`'s masonry layout. No Neon-font creation wizard — fields are edited directly in place, same interaction model as today's `MechanicalApp.svelte` (`actor.update(...)` per field). |
| Condition monitor | Single physical-only `SimpleStat` track (reuse `HealthModel`/`damageMath.ts` box math: light=1/moderate=3/serious=6/destroyed=10 boxes). Sheet displays the 10 boxes and the current stage label with its rules text (TN modifier, speed reduction, rigger resistance requirement). **No automated enforcement** — GM manually applies the speed/initiative/rigger-resistance consequences. |
| Garage tab | New feature, not a port. Character drags a Mechanical actor onto the Garage tab; stores a UUID reference on the character (new field, character model). Garage renders one compact card per linked vehicle. |
| Garage vehicle card | Shows name, condition monitor, key stats (handling/speed/body/armor), and roll buttons for driving-relevant tests. Clicking the card opens the full `MechanicalSheet` for everything else (mounts, commodity, category, etc.). |
| Driving rolls | The linked character (owner of the Garage entry) is always assumed to be the driver — no passenger/rigger-drives-instead branching. Roll button fires the character's vehicle-category skill against the Mechanical actor's `handling` (or `handlingRoad`/`handlingOffRoad`) as TN, through the existing roll pipeline (`diceFormula.ts` / orchestration services), same as any other skill roll. |

---

## MoSCoW

### MUST

1. Convert all numeric `MechanicalModel` fields to `SimpleStat` (`{ value, mod }`); update `MechanicalApp.svelte` bindings from `system.<field>` to `system.<field>.value`.
2. Add `mechanical` entry to `GADGET_TARGETS` (`gadgetTargets.ts`) with a curated `mechanicalProperties()` list covering the newly-moddable `.mod` paths.
3. Add a physical-only condition monitor to `MechanicalModel` (`EmbeddedDataField(SimpleStat)` or a slim reuse of `HealthModel`'s physical track shape) — 10 boxes, no stun track.
4. Add a derived stage getter (light/moderate/serious/destroyed) using existing `damageMath.ts` box thresholds (1/3/6/10), and display it plus its rules text (TN modifier, speed reduction %, rigger resistance requirement) on the sheet. No automated application.
5. Rebuild `MechanicalApp.svelte` on `PackeryGrid` + card components, matching `CharacterSheetApp.svelte`'s structure (drop `ItemSheetWrapper csslayout="double"`).
6. Add a vehicle-link field to the character model (array of Mechanical actor UUIDs) and wire drag-drop onto the Garage tab to populate it.
7. Build the Garage tab content: replace the placeholder `<p>` in `Register.svelte` with a component rendering one compact vehicle card per linked UUID.
8. Vehicle card: name, condition monitor display, handling/speed/body/armor, roll button(s) for driving tests (character's vehicle skill vs. Mechanical's handling TN via existing roll pipeline), click-through to open full `MechanicalSheet`.

### SHOULD

9. Unlink action on the vehicle card (remove a UUID from the character's garage list without touching the Mechanical actor itself).
10. Mechanical actor icon/token defaults appropriate to `category` (car vs. drone vs. aircraft, etc.) if not already covered by `customToken`.

### COULD

11. Additional `gadgetType` editors specific to mechanical upgrades (e.g., a dedicated "engine swap" gadget editor beyond the generic gadget flow), analogous to `WeaponModApp`.
12. Aircraft external missile mounts (Body-rating-count, non-hardpoint/firmpoint) as a distinct tracked field.

### WON'T (this feature)

- ~~Mounts wired to actual weapon items / drag-drop weapon-to-mount / Body-derived capacity enforcement.~~ Superseded — mount flag wiring (`isHardpoint`/`isFirmpoint` on vehicle-owned weapons) shipped as part of the inventory system, independent of this techspec.
- ~~Rigger control pool computation, `TechInterfaceModel.rigger.subscribers` linkage to a Mechanical actor, jack-in/possession UI.~~ Superseded — see `.zone/techspecs/TECHSPEC-vehicle-rigger.md` (seated/jacked-in flow, VCR item selection, Driving Test + Gunnery TN reduction, capped Control Pool).
- Automated enforcement of condition-monitor consequences (speed reduction, driver initiative penalty, forced rigger resistance rolls).
- Maneuver Score derived calculation (Vehicle + Terrain + Speed + Driver points) — still deferred, now tracked as a WON'T in `TECHSPEC-vehicle-rigger.md` pending its own future phase.
- Multi-driver / passenger / rigger-drives-instead branching on the Garage card — resolved in `TECHSPEC-vehicle-rigger.md` (seated is per-character-per-entry, multiple characters may be seated in the same vehicle from their own garages).

---

## Affected Files

| File | Change |
|---|---|
| `module/models/actors/MechanicalModel.ts` | Convert numeric fields to `SimpleStat`; add condition monitor field |
| `module/ui/actors/MechanicalApp.svelte` | Rebuild on `PackeryGrid`; update field bindings to `.value` |
| `module/services/gadgets/gadgetTargets.ts` | Add `mechanical` target + `mechanicalProperties()` |
| `module/services/combat/damageMath.ts` | Reuse as-is for vehicle stage derivation (no changes expected) |
| `module/models/actors/CharacterModel.ts` (or equivalent) | Add garage vehicle-link UUID array field |
| `module/ui/actors/actor-components/Register.svelte` | Replace Garage placeholder with real component |
| `module/ui/actors/actor-components/Garage.svelte` | New — renders linked vehicle cards, handles drag-drop |
| `module/ui/actors/actor-components/GarageVehicleCard.svelte` | New — compact card: stats, condition monitor, roll buttons, click-through |
| `lang/config/MechanicalConfig.ts` | Add condition-monitor and stage-label keys |
| `lang/en.json` | Add corresponding localization strings |

---

## Critical Invariants

- `mechanical` GADGET_TARGETS properties must only expose `.mod`-suffixed paths (per the existing gadget system invariant) — the SimpleStat conversion in MUST #1 is a prerequisite for MUST #2, not independent.
- Garage vehicle-link is a UUID reference, not an embedded/duplicated document — the Mechanical actor remains a standalone actor, editable independently via its own sheet.
- Condition-monitor stage thresholds (1/3/6/10 boxes) must come from the existing `damageMath.boxesForLevel`, not a re-derived constant — keeps character and vehicle staging math from drifting apart.
- Driving-roll TN must read from `handlingRoad`/`handlingOffRoad` when `vehicleType === "ground"`, else `handling` — matching the branching already present in `MechanicalApp.svelte`'s existing display logic.
