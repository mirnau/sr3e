---
title: Specs
nav_order: 2
has_children: true
---

# How to Write Specs

Use the RFC 2119 / RFC 8174 convention (UPPERCASE “normative keywords”). Add this one‑liner at the top of every spec:

> This spec uses the key words MUST, MUST NOT, SHOULD, SHOULD NOT, and MAY as defined in RFC 2119/RFC 8174.

## Normative keywords
- MUST: absolute requirement; non‑conformant if unmet.
- MUST NOT: absolute prohibition.
- SHOULD: strongly recommended; may be violated if there’s a documented, specific reason.
- SHOULD NOT: strongly discouraged; exceptions must be documented.
- MAY / OPTIONAL: truly optional behavior.

## “WON’T” vs “MUST NOT”
- MUST NOT: forbidden behavior within scope.
- WON’T (Out of scope): intentionally not implemented feature. Put these under an “Out of scope / Non‑goals” section, not in the normative list.

## House style for SR3E specs
- One capability/invariant per card (not a mixed list).
- Give each card an ID like `REQ-ACT-C-HEALTH-001`.
- 2–5 Acceptance Criteria bullets per card; tests map 1:1 to ACs.
- Use AC numbering tied to the card: `AC-<NNN>.<index>` (e.g., `AC-001.3`).

## Example card snippet (from Health)

{% raw %}

{% include req-card.md
   id="REQ-ACT-C-HEALTH-002"
   title="Track & Overflow bounds"
   component="Actors > Components > Health"
   level="MUST"
   description="Stun/Physical tracks are 10 boxes (0-10); Overflow is a non-negative integer."
   ac="- AC-002.1: Setting system.health.stun.value to -1 fails validation.
- AC-002.2: Setting system.health.stun.value or physical.value above 10 fails validation.
- AC-002.3: Non-integer assignment to a track value fails validation.
- AC-002.4: Setting system.health.overflow.value to -1 fails validation.
- AC-002.5: Assigning a non-integer to system.health.overflow.value fails validation.
- AC-002.6: Increasing overflow does not change penalty directly (see 004)."
   non_goals="Box rendering and overflow controls are UI concerns; this card constrains data only."
%}
{% endraw %}