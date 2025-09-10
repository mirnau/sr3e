---
title: Skill Response Procedure
parent: Procedures
grand_parent: Documentation
nav_order: 8
---

# SkillResponseProcedure

Defender-side response to a SkillProcedure contest. Hydrates from the export and replies with a single roll to the contest service.

---

## Role in the system

- Defender-only; never initiates a contest.
- Uses the skill id and names from the export to configure dice and labels.
- Mirrors specialization cap logic for pool dice when needed.
- Does not self-publish; replies into the contest.

---

## API reference

- Construction: via export + `ProcedureFactory.Create("skill-response", { actor, args: { contestId } })`.
- `hasTargets`: false; `isOpposed`: false.
- `shouldSelfPublish()`: false.
- `getKindOfRollLabel()` / `getPrimaryActionLabel()`: localized Respond.
- `setResponseBasis(basis)`: configure from a hydrated `{ type: "skill", id, name, specialization?, poolKey?, dice }`.
- `async fromContestExport(exportCtx, { contestId })`: resolve skill from id and set `dice`, `title`, and pool cap when relevant.
- `async execute({ OnClose?, CommitEffects? })`: attaches `options.type = "skill"` plus skill/specialization/pool metadata; delivers response.
- Serialization extras: contest id and skill/spec/pool identifiers and names.

