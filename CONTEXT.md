# sr3e - Shadowrun 3rd Edition Foundry VTT System

## For AI Assistants

Before writing any code, read `package.json` to determine the exact versions of Svelte, Vite, TypeScript, and other dependencies. Do not assume version numbers or fall back on patterns from older versions — particularly for Svelte, where the rune-based API (Svelte 5) differs fundamentally from Svelte 4 and earlier.

## What This Is

`sr3e` is a TypeScript rewrite of a Foundry VTT game system for Shadowrun 3rd Edition. The old JavaScript implementation remains the behavioural reference during migration:

`C:\Users\mikae\AppData\Local\FoundryVTT\Data\systems\old_project\sr3e\`

The rewrite is not a direct language port. It replaces ad-hoc JavaScript and Svelte code with a layered architecture, stricter types, and SR3e rule logic separated from presentation.

## Architecture

### Actor sheet flow (mandatory)

```text
Svelte Components <-> IStoreManager <-> Foundry VTT
```

All Svelte components that render actor or item data **must** read and write exclusively through IStoreManager stores. This is non-negotiable and applies to both actor sheets and item sheets. IStoreManager serves two roles here simultaneously:

- **Foundry sync:** store writes propagate to `actor.update()`; Foundry `updateActor` hooks propagate external writes back into stores.
- **Intra-sheet reactive bus:** all components on the same actor sheet share store instances keyed by `${uuid}:${path}`. A write from one component (e.g. decrement skill pool) is immediately visible to all others (e.g. the pool display) — enabling live previews before any commit reaches Foundry.

### Service / combat flow

```text
Service -> actor.update() -> Foundry VTT -> updateActor hook -> IStoreManager -> Svelte Components
```

Services (combat resolution, roll execution, damage application) write directly to Foundry via `actor.update()`. StoreManager's hook subscription propagates any change into open sheet stores automatically. Services do not call StoreManager directly.

### Layers

- **Svelte UI:** Presentational components only. Actor components receive typed props such as `{ actor: SR3EActor }` and get all data from IStoreManager stores — never from `actor.system.*` directly.
- **Service layer:** Singleton services with static `Instance` getters. Services own SR3e rules, validation, and workflows. They write to Foundry directly; reactivity is handled by the hook chain.
- **IStoreManager:** Game-wide singleton. Manages store lifecycle with per-document reference counting. Registers Foundry hooks on first subscriber, cleans up on last. Also the intra-sheet communication channel between sibling components. Subscribes to both `updateActor` and the custom `actorSystemRecalculated` hook — the latter is fired manually after roll procedures and gadget mutations to force store refresh outside the normal update cycle. Any code that mutates actor state outside of a standard `actor.update()` call must fire `actorSystemRecalculated`.
- **Foundry VTT 14.361:** Framework integration, document persistence, hooks, and flags. Svelte components should not call Foundry APIs directly.

**Foundry document roles in this architecture:**

- **Actor/Item subclasses** (`SR3EActor`, `SR3EItem`, etc.) are schema containers and document identity. They hold no logic. `prepareData()` is intentionally unused — the Handlebars passive render pipeline is bypassed entirely.
- **Sheet classes** (`SR3EActorSheet`, etc.) are Svelte mount points only. Their sole responsibility is injecting the Svelte component tree into the Foundry application shell.
- All reactive data flows: Foundry document → IStoreManager → Svelte stores → UI. There is no Handlebars template layer.

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

See `PROGRESS.md` for the full migration status — what is done and what is next.

## Domain Concepts

**Gadget** — A buyable, stat-modifying add-on that attaches to a parent item (weapon, gear, etc.) and contributes additively to that item's stat totals. The ActiveEffect system is intact and works as Foundry intends; gadgets extend it without replacing it.

Structurally: a gadget is a first-class `Item` of `type: "gadget"`. Attachment is not stored on the gadget item itself. Instead, the gadget's `ActiveEffect` documents are cloned onto the target item's embedded effects collection. The link back to the source gadget is stored in `flags.sr3e.gadget.origin`. Multiple effects sharing the same `origin` form one logical gadget group.

Effects target `system.<stat>.mod` via `ACTIVE_EFFECT_MODES.ADD`. Every stat is a `SimpleStat` with `value` (base) and `mod` (AE interface). The displayed total is `value + mod`. Two targets exist:
- `"character"` — `transfer: true`, effect propagates to the owning actor via Foundry's `applyActiveEffects()` at `prepareData` time
- `"self"` — `transfer: false`, effect modifies only the parent item's own fields

`GadgetEffect` (the class extending `ActiveEffect`) is currently a stub — tag class only, no custom `apply()` logic. Do not expect it to carry behaviour.

The gadget system exists in the old JS project and is pending migration. Reference implementation: `old_project/sr3e/module/models/effects/Gadget.js` and `old_project/sr3e/module/svelte/apps/gadgets/WeaponModApp.svelte`.

**Known design tension:** using a read-write store for `.mod` risks an infinite update loop when AEs apply (AE applies → store writes → triggers update → AE applies again). The old project worked around this by using a read-only store for `.mod`, which broke reactive updates. The new TS `GetSimpleStatROStore` uses `GetRWStore` for `.mod` with a 50ms mute window — whether this fully resolves the loop under AE application is unverified.

## Load-Bearing Decisions

Detailed records live in `docs/adr/`.

| Decision | Current Choice |
|---|---|
| Service pattern | Singleton services with static `Instance` getters. |
| Actor/item writes | Any code may call `actor.update()` / `item.update()` directly. StoreManager's hook subscription propagates the change into any open sheet's stores automatically. |
| Sheet data reads | Components get stores from StoreManager via `GetRWStore`, `GetROStore`, etc. They never read `actor.system.*` directly. |
| Migration order | Character-first: creation, sheet, advancement, then dependent systems. |
| Error philosophy | Prefer visible failures over hidden defensive handling. |
| Staged karma spending | Preview changes before committing; cancelling reverts the session. |
| Karma pool | Starting pool is free; earned pool is derived from lifetime karma and metatype factor. |
| Karma factor fallback | Standard fallback is `0.05`; humans use `0.1`. |
| Skill deletion | Delete skill items when rating reaches 0. |
| Character creation cap | Skill rating max is 6 during character creation. |
| Minimum attribute | Attributes start at minimum rating 1. |
