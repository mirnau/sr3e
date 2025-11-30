---
title: Explosive Procedure
parent: Procedures
grand_parent: Documentation
nav_order: 11
---

# ExplosiveProcedure

Placeholder subclass reserved for explosive/grenade/launcher actions. The class currently extends `AbstractProcedure` without custom logic; the family services and full flow will be documented once implemented.

---

## Status

- Registered in `ProcedureFactory` and routing, but not yet feature-complete.
- Will mirror firearm/melee patterns: plan → compose → execute → export contest (if any) → resistance.

---

## Intended responsibilities

- Precompute blast template, range, and cover effects.
- Export appropriate responder prompt (likely Dodge or Evasion).
- Provide resistance-prep for area damage and staging.

