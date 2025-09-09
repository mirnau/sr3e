---
title: Specs
nav_order: 2
has_children: true
---

# Citations
We cite physical rulebooks using Harvard-style in-text references (Abbrev Year, p. X). See ../00-about/references.md for full entries.

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
- One requirement per line; start with the keyword, then the behavior.
- Give each requirement an ID like `REQ-ACT-PC-HEALTH-001`.
- Follow with Acceptance Criteria (AC1, AC2, …); tests map 1:1 to ACs.
- Reference config keys exactly (e.g., `sr3e.damageType.*`), no remaps.

## Template snippet
```
---
title: <Feature>
parent: <Section>
grand_parent: <Parent>
---

> This spec uses the key words MUST, MUST NOT, SHOULD, SHOULD NOT, and MAY as defined in RFC 2119/RFC 8174.

## Requirements
- REQ-<DOMAIN>-<AREA>-<NNN> — MUST <behavior>
- REQ-<DOMAIN>-<AREA>-<NNN> — SHOULD <behavior>

## Acceptance Criteria
- AC1: <verifiable outcome for REQ‑NNN>
- AC2: <verifiable outcome for REQ‑NNN>

## Out of scope / Non‑goals
- WON’T <behavior/feature>; rationale <short reason>

## Notes
- Uses `sr3e.<key>` config; e.g., `sr3e.damageType.l`, `sr3e.weaponMode.burst`.
```
