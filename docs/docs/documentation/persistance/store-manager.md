---
title: StoreManager
parent: Persistence
grand_parent: Documentation
nav_order: 1
---

# StoreManager (reactive document state)

StoreManager is a thin wrapper around Svelte stores that binds them to Foundry documents (Actor, Item). It gives you reactive, path-based access to document data and keeps both sides in sync via Foundry hooks, without sprinkling `update` calls around your user interface code.

## What it does

-  One manager per document: `StoreManager.Subscribe(document)` returns a cached manager keyed by document identifier; `Unsubscribe(document)` cleans up hooks when the last subscriber leaves.
-  Path-based stores: `GetRWStore("path.to.field")` returns a writable store that updates the document and re-renders consumers; `GetROStore` mirrors document changes without writing. System is omitted from the path!
-  Derived totals: `GetSumROStore("attributes.reaction")` returns `{ value, mod, sum }` as a derived store pattern used across attributes/pools. Sum returns value + mod. This pattern is used because Active Effects must be separated to not cause infinite recursion.
-  Flags and ephemeral state: `GetFlagStore(flagKey)` binds to `flags.sr3e.<flagKey>`; `GetShallowStore(documentId, name, initial)` is for view-only ephemeral state.
-  Syncs with Foundry: Managers listen to `update<DocType>` and `actorSystemRecalculated` to keep stores fresh when other parts of the app change the document.

## Scope & boundaries

-  Provides reactive access to document fields and writes back via `update`.
-  Validation and rules belong to Procedures/Controllers and the spec for that component.
-  User interface components consume stores and emit intent; they do not implement business rules here.

## Quick usage

```html
<script>
   import { onDestroy } from "svelte";
   import { StoreManager } from "@sveltehelpers/StoreManager.svelte.js";
   let { actor } = $props();

   const storeManager = StoreManager.Subscribe(actor);
   onDestroy(() => StoreManager.Unsubscribe(actor));

   // Read/write document data (anchors to `system.` by default)
   const stun = storeManager.GetRWStore("health.stun.value"); // number (0..10)
   const overflow = storeManager.GetRWStore("health.overflow.value");

   // Read-only derived (penalty is computed elsewhere and exposed as a number)
   const penalty = storeManager.GetROStore("health.penalty"); // number (0..3)

   // Attribute pattern: value + mod => sum
   const reaction = storeManager.GetSumROStore("attributes.reaction"); // { value, mod, sum }
</script>
```

## API surface (most used)

-  `StoreManager.Subscribe(document)` -> `manager`
-  `StoreManager.Unsubscribe(document)` -> void
-  `manager.GetRWStore(path: string, isRoot = false)` -> `Writable<T>`
-  `manager.GetROStore(path: string)` -> `Writable<T>` (do not set to write)
-  `manager.GetSumROStore(path: string)` -> `Derived<{ value:number, mod:number, sum:number }>`
-  `manager.GetShallowStore(documentId: string, name: string, initial?: T)` -> `Writable<T>`
-  `manager.GetFlagStore(key: string)` -> `Writable<any>` (backs `flags.sr3e.<key>`)

Notes

-  `GetRWStore("health.stun.value")` targets `system.health.stun.value`. Pass `isRoot=true` to target a root property, for example `name`.
-  Updates call `document.update({ [fullPath]: value }, { render: false })` and rely on Svelte for a reactive user interface.
-  Always unsubscribe in `onDestroy` to release hooks when a sheet or widget is torn down.
