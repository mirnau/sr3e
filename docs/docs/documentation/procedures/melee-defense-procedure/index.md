---
title: Melee Defense Procedure
parent: Procedures
grand_parent: Documentation
nav_order: 4
---

# MeleeDefenseProcedure

Defender-side procedure for melee contests. Built by MeleeProcedure with a hydrated defense basis and a mode: Standard or Full Defense.

---

## Role in the system

- Defender step in a melee contest; never opens a new contest itself.
- Accepts a pre-hydrated `basis` (attribute or skill) and `mode` via args.
- Delivers the roll back to the contest service; does not self-publish.

---

## Behavior

- Modes:
  - Standard: base dice + pool dice + karma.
  - Full: base dice + karma (pool dice excluded on the initial test).
- Labels: title reflects Standard vs Full; flavor mirrors panel title.
- Basis: `setResponseBasis(basis)` sets dice and metadata (attribute/skill, specialization).

---

## API reference

- Construction: `ProcedureFactory.Create("melee-defense", { actor, args: { contestId, basis, mode } })`.
- `buildFormula(explodes = true)`: Computes total dice from basis/pool/karma and attaches TN.
- `shouldSelfPublish()`: false; defender replies via `deliverContestResponse`.
- `getKindOfRollLabel()` / `getPrimaryActionLabel()`: reflect Standard vs Full defense.
- `getFlavor()` / `getChatDescription()`: human-readable summary.
- `async execute({ OnClose? })`: Runs roll, packs metadata into roll JSON (basis and mode), delivers contest response.

