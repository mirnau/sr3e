# sr3e - Shadowrun 3rd Edition Foundry VTT System

## What This Is

`sr3e` is a TypeScript rewrite of a Foundry VTT game system for Shadowrun 3rd Edition. The old JavaScript implementation remains the behavioural reference during migration:

`C:\Users\mikae\AppData\Local\FoundryVTT\Data\systems\old_project\sr3e\`

The rewrite is not a direct language port. It replaces ad-hoc JavaScript and Svelte code with a layered architecture, stricter types, and SR3e rule logic separated from presentation.

## Architecture

The system follows a strict four-layer model:

```text
Svelte UI -> Service Layer -> IStoreManager -> Foundry VTT
```

- **Svelte UI:** Presentational components only. Business logic belongs in services. Actor components receive typed props such as `{ actor: SR3EActor }`.
- **Service layer:** Singleton services with static `Instance` getters. Services own SR3e rules, validation, workflows, and Foundry-facing operations that are not continuous sheet sync.
- **IStoreManager:** Central reactive data layer for continuous document state. Sheet reads and writes go through stores so lifecycle, sync, and circular-update prevention stay centralized.
- **Foundry VTT 14.361:** Framework integration, document persistence, hooks, and flags. Svelte components should not call Foundry APIs directly.

StoreManager store types:

- **Read/write stores:** Bidirectional sync with actor documents.
- **Read-only stores:** Derived or document-backed views that the UI cannot mutate.
- **Flag stores:** Persistent UI/workflow state stored in Foundry flags.
- **Shallow stores:** Transient in-memory UI state.

## Key Constraints

| Area | Rule |
|---|---|
| TypeScript | Strict mode. Avoid `any` and `object` escape hatches. |
| Error handling | Let failures surface visibly. Avoid defensive try/catch wrappers and Result-style plumbing unless there is a concrete boundary that needs it. |
| SR3e rules | Game mechanics must match the SR3e core rulebook. |
| Foundry | Target Foundry VTT 14.361 APIs. |
| UI | Keep Svelte components presentational; push rules and workflows into services. |
| Localization | Do not write `localize(key ?? "fallback")` or equivalent fallback patterns for trusted keys. |
| Testing | There is no broad automated test suite. TypeScript validates structure; Foundry playtesting validates behaviour. |
| Git | Do not commit unless the maintainer explicitly asks. |

## Styling Architecture

Two styling purposes must remain separate.

**Skinning** lives in `styles/skinning/`, `styles/sheetcard.scss`, and `styles/statcard.scss`.

- Global reskin of Foundry elements: buttons, inputs, headings, dialogs, tooltips.
- Design tokens such as `--highlight-color-primary` and `--background-color`.
- Base typographic scale for headings and shared UI primitives.
- Neon-border technique, card shadow animations, and the `clipped-corners` mixin.
- If a style applies to an element type in all contexts, it belongs in skinning.

**Domain styling** lives in areas such as `styles/actor/`, `styles/items/`, and `styles/injections/`.

- Context-specific layout and positioning.
- Deltas on top of skinning.
- Do not redeclare skinning rules in domain files.
- Do not set heading `font-size` or `font-weight` in domain files unless there is a specific, documented exception.

## Current Product Surface

Implemented or substantially migrated:

- Character creation foundation.
- Character sheet shopping mode.
- Skills component and skill buying mechanics.
- Character sheet UX improvements.
- Karma and experience core.
- Storyteller Screen with karma distribution.
- Time Manager.
- StoreManager simple-stat derived store consolidation.

Active near-term work:

- Karma-funded shopping for attributes, skills, and specializations via the existing shopping state.
- Roadmap review for the next major systems: skills tests, active effects and gadgets, chat/socket flows, combat, magic, equipment, vehicles, and economy.

## Load-Bearing Decisions

Detailed records live in `docs/adr/`.

| Decision | Current Choice |
|---|---|
| Service pattern | Singleton services with static `Instance` getters. |
| Sheet data access | Continuous sheet data goes through IStoreManager stores. |
| Dialog data access | One-time dialogs may use direct Foundry APIs through services. |
| Migration order | Character-first: creation, sheet, advancement, then dependent systems. |
| Error philosophy | Prefer visible failures over hidden defensive handling. |
| Staged karma spending | Preview changes before committing; cancelling reverts the session. |
| Karma pool | Starting pool is free; earned pool is derived from lifetime karma and metatype factor. |
| Karma factor fallback | Standard fallback is `0.05`; humans use `0.1`. |
| Skill deletion | Delete skill items when rating reaches 0. |
| Character creation cap | Skill rating max is 6 during character creation. |
| Minimum attribute | Attributes start at minimum rating 1. |
