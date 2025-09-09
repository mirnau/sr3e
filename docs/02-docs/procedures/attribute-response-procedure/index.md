---
title: Attribute Response Procedure
parent: Procedures
grand_parent: Documentation
nav_order: 10
---

# AttributeResponseProcedure

Defender-side response to an AttributeProcedure contest. Hydrates attribute key from the export and returns a single response roll.

---

## Role in the system

- Defender-only; never initiates a contest.
- Reads `attributeKey` from export or basis and sets `dice` from the defender’s attribute.
- Does not self-publish; delivers the response to the contest service.

---

## API reference

- Construction: `ProcedureFactory.Create("attribute-response", { actor, args: { contestId } })`.
- `hasTargets`: false; `isOpposed`: false.
- `shouldSelfPublish()`: false.
- `getKindOfRollLabel()` / `getPrimaryActionLabel()`: localized Respond.
- `setResponseBasis(basis)`: accepts `{ key: attributeKey, dice?, isDefaulting? }` and updates title/dice.
- `async fromContestExport(exportCtx, { contestId })`: set contest id; resolve attribute key; hydrate dice/title.
- `async execute({ OnClose?, CommitEffects? })`: attaches `options.type = "attribute"` and `options.attributeKey`; delivers response.
- Serialization extras: contest id and `attributeKey` via `toJSONExtra()` / `fromJSONExtra()`.

