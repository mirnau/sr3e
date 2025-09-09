---
title: Components
parent: Actors
grand_parent: Specs
nav_order: 2
has_children: true
toc: true
---

# Components

**Purpose.** Each component is a self-contained UI + logic unit on the PC sheet.  
Specs here define **MUST / SHOULD / WON’T** behavior and **Acceptance Criteria** for each component.

## What belongs here
- Fields owned by the component (data shape, defaults).
- UI states and transitions (enabled/disabled, visible/hidden).
- Events emitted/consumed (e.g., `sr3e.actor.health.changed`).
- Config keys it relies on (must use `sr3e.*` as-is; no remaps).
  - Example canonical keys: `sr3e.damageType.*`, `sr3e.weaponMode.*`.

**Out of scope.** Cross-component flows (e.g., global combat rules) live in their domain specs (Combat, Rolls, Items).

## Requirement IDs
Format: `REQ-ACT-PC-<COMP>-NNN`  
Examples: `REQ-ACT-PC-HEALTH-001`, `REQ-ACT-PC-DOSSIER-002`.

## Components (specs)
- **[Health](health.md)** — life state, damage, recovery, revive action.
- **[Dossier](dossier.md)** — identity, meta, portrait/banner, notes.

## Planned (stubs you can add next)
- `attributes.md` — base stats & derived values
- `skills.md` — list, pools, specialization marks
- `inventory.md` — containers, equip states, weight
- `cyberware.md` — essence, grades, install states
- `magic.md` — spell list, drain tracking
- `matrix.md` — deck status, marks, alerts
- `rigging.md` — control deck, subscribers, vehicle link
- `notes.md` — per-character journal

## File layout
