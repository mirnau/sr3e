---
title: Melee Procedure
parent: Procedures
grand_parent: Documentation
nav_order: 3
---

# MeleeProcedure

MeleeProcedure orchestrates attacker-side melee strikes. It composes a basic TN from the composer, exports a two-choice defender prompt (Standard vs Full Defense), and renders contested outcomes plus resistance prep on hit.

---

## Role in the system

- Attacker-side melee action; defender is a MeleeDefenseProcedure.
- Uses MeleeService to pre-plan a strike and to prepare damage resistance steps.
- Exports a responder UI that asks the defender to choose Standard or Full defense.
- Uses lockPriority: "advanced"; only one melee flow per actor at a time.

---

## Responsibilities

- Precompute (optional): MeleeService.planStrike to snapshot a DamagePacket.
- Execute: standard lifecycle; expires local contests after roll.
- Defense hint: provides UI label and default TN hint for the defender.
- Contest export: builds next step with `next.kind: "melee-standard"` (UI may switch to full).
- Resistance prep: builds ResistanceProcedure input via MeleeService.prepareDamageResolution.

---

## Typical flow

1. Setup: attacker + melee weapon bound.
2. Optional precompute: `precompute({ defender?, situational? })`.
3. Compose: user adjusts TN and dice; no recoil/range automation here.
4. Execute: attacker rolls; results published.
5. Contest: export asks defender to pick Standard or Full defense.
6. Resolution: on success, build damage resistance prep for the target.

---

## API reference

- `precompute({ defender?, situational? })`: Snapshot a DamagePacket for later resistance.
- `getDefenseHint()`: Returns `{ type: "skill", key: "melee", tnMod: 0, tnLabel: "Melee difficulty" }`.
- `async getResponderPromptHTML(exportCtx)`: Renders defender choice buttons.
- `buildDefenseProcedure(exportCtx, { defender, contestId, responderKey, defenseHint? })`:
  - Hydrates basis from `defenseHint` (attribute or skill) via StoreManager.
  - Creates `MeleeDefenseProcedure` with mode `"standard" | "full"`.
- `exportForContest()`: Returns `{ familyKey: "melee", weaponId, weaponName, damage?, tnBase, tnMods, next: { kind: "melee-standard", ui, args } }`.
- `buildResistancePrep(exportCtx, { initiator, target })`: Returns `{ familyKey: "melee", weaponId, weaponName, ... }` from MeleeService.
- `async renderContestOutcome(exportCtx, ctx)`: Attacker/defender summaries + roll HTML + winner message.

