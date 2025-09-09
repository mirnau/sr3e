---
title: Skill Procedure
parent: Procedures
grand_parent: Documentation
nav_order: 7
---

# SkillProcedure

Initiator-side generic skill test. Optionally targets a specialization and associated dice pool, and can export an opposed prompt handled by SkillResponseProcedure.

---

## Role in the system

- Non-weapon, actor-driven skill checks (Active/Knowledge/Language).
- Can export a simple “respond to my skill test” contest.
- Applies specialization cap (half base skill) as a pool cap when relevant.

---

## Behavior

- Construction hydrates from the actor’s `Item` skill by id and optional `specIndex`.
- Sets `title` to the skill name; `dice` to spec value or base value.
- If specialization used without explicit spec rating, inserts `spec-cap` modifier with `poolCap = floor(value / 2)`.

---

## API reference

- Construction: `ProcedureFactory.Create("skill", { actor, args: { skillId, specIndex?, title? } })`.
- `shouldSelfPublish()`: true.
- `getFlavor()` / `getChatDescription()`: label includes specialization when present.
- `async execute({ OnClose?, CommitEffects? })`:
  - Attaches `options.type = "skill"`, `options.skill = { id, name }`, `options.specialization?`, and `options.pools?`.
- `exportForContest()`: `{ familyKey: "skill", skillId, skillName, specName, poolKey, next: { kind: "skill-response", ui, args } }`.
- Serialization extras: `toJSONExtra()` / `fromJSONExtra()` capture skill/spec/pool identifiers and names.

