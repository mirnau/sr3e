# TECHSPEC: Cyberdeck + Hacker Pool (Jacked-In, VCR-Parallel; Matrix Deferred)

## Context

Grilled against the vehicle-rigger feature (`TECHSPEC-vehicle-rigger.md`) as the closest existing analog: a jack-in toggle gates a dedicated pool and a roll panel. Since that spec shipped, most of the cyberdeck's own data model already exists and is **not** new work for this pass:

- `CyberdeckModel.ts` — full schema (MPCP, persona `{bod, evasion, masking, sensor}`, `stats.{hardening, ioSpeed, responseIncrease}`, memory active/storage, `derived.{detectionFactor, hackingPool}`, utilities array, commodity/portability).
- `cyberdeckCalculations.ts` — `computeDetectionFactor`, `computeHackingPool`, `computeMatrixReaction`, `responseIncreaseMax`, utility sanitization. All already correct per the SR3 rules pasted during grilling.
- `CyberdeckApp.svelte` — full item sheet: MPCP/persona/memory/utilities editing, derived stats displayed (detection factor, hacking pool, matrix initiative string).
- `DicePoolsModel` already has a `hacking` pool field alongside `combat`/`astral`/`control`/`spell`.
- `poolRefresh.ts` already resets `dicePools.hacking.spent` at round start — the "refresh like the other pools" requirement is already satisfied, no change needed.
- `gadgetTargets.ts` already exposes `dicePools.hacking.mod` as a gadget target.

What's actually missing, found by direct diff against the rigger/VCR pattern:

1. No "jacked in" state exists for cyberdecks at all (`jackedIn` currently only lives on `GarageEntryModel`, which is vehicle-specific).
2. Nothing ever writes `system.dicePools.hacking.value` — `combat`/`astral`/`spell` are computed from attributes each render, `control` is computed from the jacked-in VCR's level; `hacking` has no equivalent `$effect`, so it is currently always 0.
3. The hacking pool `StatCard` only renders behind the GM's `alwaysShowMainPools` debug setting — no `hasHackerInterface`-style real gate like rigger's `hasRiggerInterface`.
4. There is no UI surface for jacking in or for rolling the cyberdeck's own persona stats (Bod/Evasion/Sensor).

Scope was deliberately narrowed during grilling: **Matrix mechanics (system tests, cybercombat, IC/host resolution) are out of scope.** All the SR3 computations (detection factor, hacking pool, matrix reaction/initiative, persona/memory caps) get built or reused, but no dedicated PvP/contest pipeline is built for them — mirrors this project's existing precedent of exposing a stat as an open roll (GM interprets) rather than building automated contests for every SR3 subsystem (e.g. spell drain, resistance tests elsewhere in the codebase already follow this split).

---

## Design Decisions

| Decision | Outcome |
|---|---|
| Jacked-in state location | Item-level: `jackedIn: BooleanField` added directly to `CyberdeckModel`, mirroring `GarageEntry.jackedIn` living on the vehicle link rather than the actor. Not an actor-level flag. |
| Exclusivity | Only one owned cyberdeck may have `jackedIn: true` per actor at a time (a decker runs one persona). Toggling one on sets all other owned cyberdeck items' `jackedIn` to `false` in the same batch update — enforced in the toggle handler, same invariant class as the vehicle-rigger spec's "only one seated" rule. |
| New actor tab | New `matrix` tab button in `Register.svelte`, parallel to `garage`, visible only when the actor owns ≥1 cyberdeck item (`hasCyberdeck`, same item-hook rebuild pattern already used for `isAwakened`/grimoire gating). |
| Tab layout | **No grid/card list** (rejected the `GarageVehicleCard`-style grid — an access-point/host card would be redundant, since a Matrix host is conceptually a map the character explores, not a trackable entity worth a card). Plain list of owned cyberdeck names with a jack-in toggle each; the jacked-in deck's stat panel expands inline below the list. |
| Roll panel source | Persona stats live on the **cyberdeck item**, not the actor — existing `buildAttributeSetup`/`buildDicePoolSetup` in `simpleSetups.ts` read from `actor.system`, so neither fits directly. New `buildCyberdeckStatSetup(actor, deckItem, statKey, title)` reads `deckItem.system.persona[statKey]`. |
| Roll type | Both interaction modes the composer already supports for pools/attributes must work here too: plain click → immediate simple/open roll (`executeProcedure`); shift-click → advanced roll composer with no fixed target (`openComposer`) — mirrors `onPoolCardClick` in `DicePools.svelte` exactly. `buildCyberdeckStatSetup` sets `openRoll: true`, `openTest: true`, `targetNumber: 4` (unused for open rolls, kept for shape parity with `buildDicePoolSetup`), same as the existing pool builder. |
| Which persona stats are rollable | **Bod, Evasion, Sensor** get roll buttons (each is invoked as a standalone test in the pasted ruleset — icon damage resistance, maneuver/evasion, Matrix perception). **Masking** and **Hardening** stay display-only: Masking only ever feeds Detection Factor, Hardening only ever reduces incoming Power — neither is rolled on its own per the ruleset. |
| Hacking Pool value source | `DicePools.svelte` gets a `hasHackerInterface` derived (true iff the actor owns a jacked-in cyberdeck item) and an `$effect` setting `hackingValue.set(Number(jackedDeck?.system?.derived?.hackingPool ?? 0))`, else `0` — mirrors the existing `control`/`hasRiggerInterface` block (lines 191-198) verbatim in structure, but sources the jacked-in item directly from `actor.items` (no garage-style array exists for decks, so no `garageStore`-equivalent needed). |
| Hacking Pool card visibility | Gated on `alwaysShowMainPools || hasHackerInterface`, replacing the current `alwaysShowMainPools`-only condition — same OR-pattern already used for `control`/`astral`/`spell`. |
| Matrix Reaction/Initiative ActiveEffect bonus | **Not built.** The pasted ruleset states Matrix Initiative as `Reaction (Persona) + [1 + Response Increase]D6` (SR3 p.223) — a persona-side stat, distinct from the VCR rule (SR3 p.301) which explicitly grants the rigger's *own* Reaction/Initiative a bonus. Nothing in the ruleset says jacking in modifies the character's real Reaction/Initiative, so no `ActiveEffect` is created (unlike `riggerBonusEffect.ts`). `matrixReaction`/`matrixInitiative` remain the existing display-only computed values on `CyberdeckApp.svelte` — they only become meaningful once a Matrix turn-order system exists, which is out of scope. |
| Utilities / detailed editing | Not duplicated in the Matrix tab. The jacked-in deck's expanded panel shows read-only summary stats (MPCP, memory used/max, detection factor, hacking pool, matrix reaction/initiative) plus the three roll buttons; a link/button opens the existing full `CyberdeckApp.svelte` item sheet for editing (utilities, MPCP, persona ratings, etc.) — no parallel editing UI built. |
| Access points / hosts / programs / Matrix weapons | **Out of scope**, per grilling — "worth building out later... but keep the scope smaller now." No new item types or data models beyond the `jackedIn` field. |

---

## MoSCoW

### MUST

1. Add `jackedIn: BooleanField` (default `false`) to `CyberdeckModel`'s schema.
2. Jack-in toggle handler enforces single-jacked-in-deck-per-actor: setting one owned cyberdeck's `jackedIn` to `true` sets every other owned cyberdeck item's `jackedIn` to `false` in the same update batch.
3. New `matrix` tab button in `Register.svelte`, visible only when `hasCyberdeck` (actor owns ≥1 item of type `cyberdeck`) — same item-create/update/delete hook rebuild pattern already used for `skillItems`/`magicItems`.
4. New `Matrix.svelte` (in `module/ui/actors/actor-components/`, parallel to `Garage.svelte`): plain list of owned cyberdeck items (name + jack-in toggle, no grid/card layout). Empty state when the actor owns none.
5. Expanded panel for the jacked-in deck (inline within `Matrix.svelte` or a small child component): read-only display of MPCP, memory active/storage (used/max), detection factor, hacking pool, matrix reaction, matrix initiative — reusing `cyberdeckCalculations.ts` functions, no duplicate math. Masking and Hardening shown as plain stats (no roll button). A button/link opens the deck's existing `CyberdeckApp.svelte` sheet for full editing.
6. Three roll buttons on the expanded panel: Bod, Evasion, Sensor — each built via new `buildCyberdeckStatSetup(actor, deckItem, statKey, title)` in `module/services/combat/procedures/simpleSetups.ts`, mirroring `buildDicePoolSetup`'s open-roll shape but sourcing dice from `deckItem.system.persona[statKey]`.
7. Roll-button click handling supports both interaction modes: plain click → `executeProcedure` immediately; shift-click → `openComposer` (advanced roll, no fixed target) — same branching as `onPoolCardClick` in `DicePools.svelte`.
8. `DicePools.svelte`: add `hasHackerInterface` derived (true iff actor owns a jacked-in cyberdeck item, checked directly against `actor.items`, no garage-array-equivalent needed) and a new `$effect` setting `hackingValue.set(...)` from the jacked-in deck's `system.derived.hackingPool`, else `0` — mirrors the existing `control`/`hasRiggerInterface` block.
9. Hacking pool `StatCard` visibility changes from `alwaysShowMainPools` only to `alwaysShowMainPools || hasHackerInterface`, matching the OR-pattern used for `control`/`astral`/`spell`.
10. Un-jacking (toggle off) or losing the jacked-in item (deleted/transferred) reactively drops `hasHackerInterface` to `false` and `hackingValue` back to `0` — no stale state, same reactivity guarantee `hasRiggerInterface` already has.

### SHOULD

11. Empty-state copy when the actor owns zero cyberdecks (new localization key, mirrors `garageempty`).
12. New localization keys for the `matrix` tab label and jack-in toggle label (reuse existing `CyberdeckConfig` keys — `bod`, `evasion`, `sensor`, `masking`, `hardening`, `detectionFactor`, `hackingPool`, `matrixInitiative` — for the roll-button/stat labels; no duplication needed there).

### WON'T (this feature)

- Matrix Reaction/Initiative `ActiveEffect` bonus applied to the actor's real Reaction/Initiative — not supported by the pasted ruleset, unlike the VCR rule.
- Any cybercombat/contest pipeline: System Tests (decker vs. host subsystem Success Contest), Attack Test, Maneuver Test (opposed Evasion vs. Sensor), Damage Resistance (icon or Black-IC physical/mental), Simsense Overload, Security Tally tracking.
- Access Point / Host cards or any trackable "host" data model — Matrix hosts are treated as a map/environment, not an entity.
- Matrix programs, Matrix weapons, or any new item type beyond the existing `cyberdeck` type and its existing generic `utilities` array.
- Cross-client/socket relay for jack-in state beyond ordinary Foundry item-update propagation (no dedicated GM-relay, unlike the economy/gadget mutation relays elsewhere).

---

## Affected Files

| File | Change |
|---|---|
| `module/models/items/CyberdeckModel.ts` | Add `jackedIn: BooleanField` |
| `module/ui/actors/actor-components/Matrix.svelte` | New — deck list + jack-in toggles + expanded panel for the jacked-in deck |
| `module/ui/actors/actor-components/Register.svelte` | New `matrix` tab button, `hasCyberdeck` derived, tab-content branch |
| `module/services/combat/procedures/simpleSetups.ts` | New `buildCyberdeckStatSetup(actor, deckItem, statKey, title)` |
| `module/ui/actors/actor-components/DicePools.svelte` | `hasHackerInterface` derived + `$effect` for `hackingValue`; `StatCard` visibility condition update |
| `lang/config/InventoryConfig.ts` or `CyberdeckConfig.ts` | New keys: `matrix` tab label, jack-in toggle label, empty-state copy |
| `lang/en.json` | New key strings |

---

## Post-Implementation Amendment 1: Utilities → Matrix Programs, Matrix Tab Restructure

After #222-#224 shipped, a deeper pass through SR3's actual Matrix Programs rules (p.220-222) showed the original `utilities` array (name/rating/size/type/active, memory-budget-driven) was the wrong shape — real SR3 utilities are TN modifiers on specific System Tests, not rollable/memory-tracked things, and nothing in the ActiveEffect/gadget system can reach a roll's TN modifier list. This amendment (first pass, superseded by Amendment 2 below):

- Replaced `CyberdeckModel.utilities` with `programs: {name, tnModifier}[]` (embedded `MatrixProgramModel`) — deleted `CyberdeckUtilityModel` and all utility-type/memory-usage plumbing.
- Split Sleaze out to a dedicated `sleazeRating` field (capped at MPCP, separate from the Persona sum) — it only ever feeds Detection Factor, never a roll, so it was never really a "utility" either. This part stands; Amendment 2 doesn't touch it.
- Dropped Active/Storage Memory "used" auto-computation — it had no data source once utilities' `size` field was gone. `memory.{active,storage}.max` remain manual capacity fields. This part stands too.
- Restructured the Matrix tab from one flat component into the Garage-tab pattern: `Matrix.svelte` (grid vs. single-sheet switch) → `CyberdeckCard.svelte` (grid card) / `CyberdeckSheet.svelte` (expanded view).

## Post-Implementation Amendment 2: Matrix Program becomes its own Item type, decoupled from the deck

Embedding programs on the cyberdeck (Amendment 1) was itself the wrong shape — programs are conceptually independent of any specific deck, and this codebase's convention is a dedicated item type for cross-cutting concepts (gadgets, foci), not embedding one concept's schema inside another item's. Reverted the embedded array; instead:

- New standalone item type `matrixprogram` (`MatrixProgramModel`: `tnModifier` + `journalId`/`portability`/`commodity`, following the `VehicleControlRigModel` template exactly) — registered in `system.json`, `sr3e.ts`, `configuration-keys.ts`, with its own sheet (`MatrixProgramSheet.ts` → `MatrixProgramApp.svelte`) and icon (`matrix-svgrepo-com.svg`).
- `CyberdeckModel` carries no program-related field at all — `CyberdeckApp.svelte` has no Programs section.
- New `MatrixProgramCard.svelte` renders each owned Matrix Program item as a clickable card directly in the Matrix tab (`Matrix.svelte`), independent of which (if any) deck is jacked in.
- Composer channel unchanged in shape (`composerState.programModifiers`, `toggleComposerProgramModifier`) but now keyed `program-<itemId>` (a real, stable Foundry item id) instead of an embedded-array index.
- `Register.svelte`'s Matrix tab visibility gate changed from `hasCyberdeck` to `hasCyberdeck || hasMatrixProgram` — a character with only Matrix Programs and no deck yet still sees the tab.
- `registerTabForItem` routes both `cyberdeck` and `matrixprogram` item creation to the `matrix` tab.

Still WON'T: the System Test/cybercombat resolution pipeline these TN modifiers would actually feed into. Programs affect a TN when the GM manually runs the relevant test; there's still no automated contest.

## Post-Implementation Amendment 3: Matrix Initiative replaces standard Initiative; derived-values cleanup

The earlier "no ActiveEffect bonus" conclusion (Design Decisions table, "Matrix Reaction/Initiative ActiveEffect bonus") is **superseded**. User supplied the correct formula and confirmed it should mechanically replace standard Initiative while jacked in:

`Matrix Initiative = [Intelligence + (2 x Response Increase)] + [1 + Response Increase]D6`

- New `module/services/effects/matrixInitiativeFormula.ts`: `resolveInitiativeFormula(actor)` picks `matrixInitiativeFormula` (Intelligence-based) when `findJackedInCyberdeck(actor)` finds one, else `standardInitiativeFormula` (the original Reaction+Initiative computation). `SR3EActor.rollInitiative()` now delegates to this instead of inlining the Reaction/Initiative read. This is a **full replace**, not an additive `ActiveEffect` like the VCR rigger bonus — no `.mod` field is written.
- Deleted `computeMatrixReaction` from `cyberdeckCalculations.ts` (the old Reaction-based, display-only formula) — superseded by the Intelligence-based formula above, which lives in the initiative service, not the deck-display calculations file.
- Removed Hacking Pool and Matrix Initiative from `CyberdeckApp.svelte`'s (now-deleted) Derived section and from `CyberdeckStatsPanel.svelte` (Matrix tab) — Hacking Pool already shows on the character sheet's Dice Pools row once jacked in; Matrix Initiative is now only meaningful at roll time, not as a static readout anywhere.
- Detection Factor moved into the Persona `ItemSheetComponent` (styled via `LabeledNumberInput` with `disabled=true`, matching Commodity's "Days" field look) — the Derived section is gone entirely from `CyberdeckApp.svelte`.
- Removed now-unused `cyberdeck.hackingPool`/`cyberdeck.matrixInitiative`/`cyberdeck.derived` localization keys.

## Post-Implementation Amendment 4: Two-column Matrix Program sheet + "patch" gadget subtype

- `MatrixProgramApp.svelte` changed from `csslayout="triple"` to `csslayout="double"` — too little content to justify three columns.
- `MatrixProgramModel.tnModifier` converted from a flat `NumberField` to `EmbeddedDataField<ModifiableNumberModel>` ({value, mod}) — the same shape `WeaponModel.damage`/`range`/`recoilComp` already use — specifically so a gadget can safely add to `.mod` without stomping the base `.value`. `MatrixProgramCard.svelte` reads the effective value via `totalNumber(program.system?.tnModifier)`.
- New gadget subtype `patch` (`GADGET_TYPE_KEYS`, `gadgetTargets.ts`'s `GADGET_TARGETS.patch`, itemType `matrixprogram`) — lets a Matrix Program have a gadget attached, exactly like Weapon/Wearable/Focus already do (`GadgetViewer` slot in `MatrixProgramApp.svelte`). Its `properties()` list is deliberately minimal (just `system.tnModifier.mod`) — patches lean on the generic ActiveEffects editor for anything beyond that, rather than a curated stat list, per explicit instruction ("they can do whatever they want with it").
- Icon: `puzzle-piece-svgrepo-com.svg`, registered via `registerDocumentTypeIconRule` keyed on `source.system?.type === "patch"`, same mechanism as the existing `fetish` icon override.

## Post-Implementation Amendment 5: Deletable from Matrix tab; Essence cost

- Added a trash-can delete button (same `DialogV2.confirm` + `deleteEmbeddedDocuments` pattern as `InventoryCard.svelte`) to both `CyberdeckCard.svelte` (grid view) and `CyberdeckSheet.svelte` (expanded jacked-in view). New `deletecyberdecktitle` modal key.
- New `CyberdeckModel.essenceCost` field. Applied as a permanent `-essenceCost` `ActiveEffect` on the owning character via a new shared `registerItemEssenceEffectHook` (`module/foundry/itemEssenceEffect.ts`), extracted from the existing `vehicleControlRigEssence.ts` so both VCR and cyberdeck share one implementation. Fires on `createItem` once the item is embedded on an actor — **not** gated on `jackedIn`, matching how VCR's essence cost already worked (installed hardware, paid once, independent of jack-in state).

## Post-Implementation Amendment 6: Expanded cyberdeck sheet is a Packery grid, matching Garage's expanded vehicle sheet

`CyberdeckSheet.svelte` (the jacked-in expanded view) was flat `asset-card` divs — restructured to the same `PackeryGrid` + `SheetCard`-per-card recipe `GarageVehicleSheet.svelte` uses: `<PackeryGrid gridPrefix="matrix" itemSelector="matrix-packery-grid-item">` wrapping one `SheetCard` per section (header/jack-toggle/delete, stats, roll buttons). `styles/actor/components/matrix.scss` gained the matching `.matrix-cyberdeck-sheet` reskin block — sizer divs hidden, `.matrix-packery-grid-item` extends `%packery-grid-item-base`, `.sheet-card-*` recolored to the flat teal/dark/glow family — copied line-for-line from garage.scss's `.garage-vehicle-sheet` block with the `garage-`/`matrix-` prefix swapped. `.matrix-sheet-header`/`.matrix-sheet-name` mirror `.garage-vehicle-header`/`.garage-vehicle-name` the same way.

---

## Critical Invariants

- Only one owned cyberdeck per actor may have `jackedIn: true` at any time — enforced in the toggle handler's batch update, never left to UI-only hiding.
- `system.dicePools.hacking.value` is only ever written by the jacked-in-deck `$effect` — no manual input field for it anywhere (matches how `control` is rigger-only-derived, not player-editable).
- No `ActiveEffect` is created on jack-in for a cyberdeck — Matrix Reaction/Initiative remain display-only, never written to the actor's real attributes.
- No host/access-point/IC data model is introduced by this feature.
