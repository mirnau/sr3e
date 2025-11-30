---
title: Dodge Procedure
parent: Procedures
grand_parent: Documentation
nav_order: 5
---

# DodgeProcedure

Defender-side procedure for ranged (firearm) challenges. Instantiated by FirearmProcedure and returns a single defense roll to the contest service.

---

## Role in the system

- Defender in firearm contests; never starts a contest.
- Title and labels are localized (Dodge/Dodge! etc.).
- Seeds base TN to 4; composer modifiers apply as usual.
- Does not self-publish; responds into the contest.

---

## API reference

- Construction: `ProcedureFactory.Create("dodge", { actor, args: { contestId } })`.
- `hasTargets`: false.
- `shouldSelfPublish()`: false.
- `getKindOfRollLabel()` / `getPrimaryActionLabel()`: localized Dodge labels.
- `getChatDescription()`: localized description.
- `async execute({ OnClose?, CommitEffects? })`: Standard roll lifecycle; calls `deliverContestResponse(roll)`.

