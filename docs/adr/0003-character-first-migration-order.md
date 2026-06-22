# ADR 0003: Character-First Migration Order

## Status

Accepted

## Context

The system is a large migration from an existing JavaScript implementation. Combat, magic, equipment, chat flows, and economy all depend on accurate character data and advancement rules.

## Decision

Migrate character foundations first:

- Character creation.
- Character sheet workflows.
- Attribute and skill shopping.
- Karma and advancement.
- Storyteller-facing karma distribution.

Build dependent systems after that foundation is stable.

## Consequences

Later systems should reuse the character, skill, karma, and StoreManager patterns rather than inventing parallel state paths.

Planning for combat, magic, equipment, vehicles, and economy should be revisited against the current character architecture before implementation.
