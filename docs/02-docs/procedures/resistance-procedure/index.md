---
title: Resistance Procedure
parent: Procedures
grand_parent: Documentation
nav_order: 6
---

# ResistanceProcedure

Damage resistance step run by the defender after a successful attack. Built from a prepared payload (prep) produced by the attacking family (Firearm/Melee).

---

## Role in the system

- Standalone follow-up test; not opposed and not a responder prompt.
- Receives `prep` containing weapon identifiers, base TN, and resistance TN modifiers.
- Computes final TN and runs a Body test by default.
- Applies damage outcomes via OpposeRollService on resolution.

---

## Responsibilities

- Seed state from `prep`:
  - `targetNumberStore = prep.tnBase`.
  - `modifiersArrayStore = prep.tnMods` (armor and situational effects).
  - `dice = Body` (from defender attributes).
- Annotate `SR3ERoll` options with TN breakdown for rendering.
- On resolve, call `OpposeRollService.resolveDamageResistanceFromRoll` with full context.

---

## API reference

- Construction: `ProcedureFactory.Create("resistance", { actor, args: { prep } })`.
- `caller`: overridden to always return the defender actor provided at construction.
- `getFlavor()` / `getChatDescription()`: includes attack name and staged step information.
- `finalTN({ floor = 2 })`: Computes clamp base + sum(modifiers), default floor 2.
- `async onChallengeWillRoll({ baseRoll, actor })`: attaches TN base/mods/targetNumber into roll options.
- `async execute({ OnClose?, CommitEffects? })`: Standard lifecycle; on resolve updates actor state.
- `exportForContest()`: lightweight snapshot — familyKey/weapon references.
- `toJSON()` / `static fromJSON(obj)`: simplified serialization using only `prep`.

