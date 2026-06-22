# sr3e — Claude Project Instructions

## Architecture

Four-layer model: `Svelte UI → Service Layer → IStoreManager → Foundry VTT`

StoreManager is a game-wide singleton. All actor/item sheet components MUST wire up via IStoreManager stores — never read `actor.system.*` directly in a component.

Read `CONTEXT.md` for the full architectural picture. Read `package.json` for version numbers — never guess or use legacy patterns.

## Svelte 5 — prop untrack pattern

Props used synchronously for one-time initialization (StoreManager subscriptions, store path construction) must be snapshotted with `untrack`. Use the `p` intermediary — no underscore variables:

```ts
const p = $props<{ actor: SR3EActor }>();
const actor = untrack(() => p.actor);
```

Multi-prop example:

```ts
const p = $props<{ actor: SR3EActor; attributeKey: string; label: string }>();
const actor = untrack(() => p.actor);
const attributeKey = untrack(() => p.attributeKey);
```

The `_` prefix is acceptable exclusively for prop intermediaries in this pattern — not for general variable naming.

## Error handling

Belt OR suspenders — never both. Handle nullability/errors at the boundary where they enter (e.g. a Foundry API call), return a clean type, and let callers trust it. Never propagate `T | null` through your own return types forcing every caller to hedge again.

- No underscore-prefixed variables except prop intermediaries in the untrack pattern above
- Files 50–150 lines; extract responsibility if longer
- No comments unless the WHY is non-obvious
- Autodocumenting names over inline documentation
