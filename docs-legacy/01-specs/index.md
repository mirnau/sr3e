---
title: Specs
nav_order: 2
has_children: true
---

# How to Write Specs

Use the RFC 2119 / RFC 8174 convention (UPPERCASE “normative keywords”). Add this one‑liner at the top of every spec:

> This spec uses the key words MUST, SHOULD, and MAY as defined in RFC 2119/RFC 8174.

## Normative keywords
- MUST: absolute requirement; non‑conformant if unmet.
- MUST NOT: absolute prohibition.
- SHOULD: strongly recommended; may be violated if there’s a documented, specific reason.
- SHOULD NOT: strongly discouraged; exceptions must be documented.
- MAY / OPTIONAL: truly optional behavior.

## House style for SR3E specs
- One capability/invariant per card (not a mixed list).
- Give each card an ID like `REQ-ACT-C-HEALTH-001`.
- 2–5 Acceptance Criteria bullets per card; tests map 1:1 to ACs.
- Use AC numbering tied to the card: `AC-<NNN>.<index>` (e.g., `AC-001.3`).