# ADR 0006: Svelte Reactive Frontend Bypasses Foundry's Handlebars Pipeline

## Status

Accepted

## Context

Foundry VTT's default rendering model is passive: `Actor.prepareData()` computes derived data, and a Handlebars template renders it on each update cycle. This model is pull-based — the sheet re-renders from scratch whenever Foundry decides to call `render()`.

This project requires a reactive, fine-grained UI that responds to individual field changes without full re-renders. Handlebars templates cannot provide this.

## Decision

The Handlebars pipeline is bypassed entirely. Sheet classes (`SR3EActorSheet`, etc.) exist only to mount Svelte component trees into the Foundry application shell. All reactive data flows through IStoreManager stores, not through `prepareData()` or Handlebars templates.

Consequences for document subclasses:

- `Actor` and `Item` subclasses are schema containers only. They define document structure and hold no logic.
- `prepareData()` is intentionally unused and should not be implemented.
- Svelte components read from IStoreManager stores. They do not call `actor.system.*` directly.

## Consequences

- Foundry developers familiar with the Handlebars pipeline will not find the expected `getData()` / `activateListeners()` / `prepareData()` pattern. All of that is replaced by store subscriptions.
- Foundry version upgrades that change the Handlebars render cycle do not affect this project. Upgrades that change document schema, hook timing, or ApplicationV2 mounting do.
- Any code that calls `sheet.render()` to refresh UI is redundant — store updates propagate reactively without it.
