---
title: Attribute Procedure
parent: Procedures
grand_parent: Documentation
nav_order: 9
---

# AttributeProcedure

Initiator-side pure attribute test (e.g., Strength, Reaction). Can export an opposed prompt handled by AttributeResponseProcedure.

---

## Role in the system

- Simple attribute checks that still benefit from the composer and contest plumbing.
- Hydrates dice directly from the actor's attribute total and sets a readable title.
- Can export a responder prompt for an opposed attribute contest.

---

## Behavior

- Constructor accepts `{ attributeKey = "strength", title? }`.
- Title uses `config.attributes[attributeKey]` when available.
- Dice equals attribute rating (total/value) for the key.
- Self-publishes results; not limited to opposed contexts.

---

## API reference

- Construction: `ProcedureFactory.Create("attribute", { actor, args: { attributeKey, title? } })`.
- `shouldSelfPublish()`: true.
- `getFlavor()` / `getChatDescription()`: "Attribute Test" / "test".
- `async execute({ OnClose?, CommitEffects? })`:
  - Attaches `options.type = "attribute"` and `options.attributeKey`.
- `exportForContest()`: `{ familyKey: "attribute", attributeKey, next: { kind: "attribute-response" } }`.
- Serialization extras: attribute key persisted via `toJSONExtra()` / `fromJSONExtra()`.

