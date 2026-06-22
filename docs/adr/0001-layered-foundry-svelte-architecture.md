# ADR 0001: Layered Foundry/Svelte Architecture

## Status

Accepted

## Context

The original JavaScript system mixed Foundry APIs, SR3e rules, and Svelte presentation code. That made component changes risky and forced contributors to understand too much unrelated behaviour before editing a screen.

The TypeScript rewrite needs a stable pattern for sheet work, service work, and Foundry integration.

## Decision

Use this layering rule throughout the project:

```text
Svelte UI -> Service Layer -> IStoreManager -> Foundry VTT
```

Svelte components are presentational. Services own rules and workflows. IStoreManager owns continuous reactive document access for sheets. Foundry APIs remain behind services and infrastructure except for narrow framework integration points.

## Consequences

Components should stay small enough to reason about and should not contain SR3e buying, validation, or document persistence logic.

StoreManager becomes load-bearing infrastructure. Changes to store lifecycle, hook cleanup, circular-update prevention, or path resolution need careful review because they affect every sheet.

One-time dialogs can still use direct Foundry document operations through a service when a reactive store would add ceremony without value.
