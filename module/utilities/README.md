# StoreManager Utility

## Overview

The StoreManager utility bridges Foundry VTT's document system with Svelte's reactive stores, enabling seamless two-way data synchronization between the backend data model and frontend UI components.

## Files

- **IStoreManager.ts** - TypeScript interface defining the StoreManager contract
- **StoreManager.svelte.js** - Main implementation with full JSDoc comments
- **StoreManager.svelte.d.ts** - TypeScript declarations for the implementation
- **StoreManager.example.ts** - Usage examples and patterns

## Key Features

- **Bidirectional Sync**: Changes in UI update documents, document changes update UI
- **Reference Counting**: Shared manager instances with automatic cleanup
- **Hook Management**: Automatic registration and cleanup of Foundry hooks
- **Circular Loop Prevention**: Muting mechanism prevents infinite update loops
- **Multiple Store Types**: Support for read-write, read-only, derived, shallow, and flag stores
- **Type Safety**: Full TypeScript support with generics

## Store Types

### 1. Read-Write Stores (GetRWStore)
Bidirectional synchronization between Foundry documents and Svelte UI.
```typescript
const bodyStore = storeManager.GetRWStore<number>("attributes.body", false);
// Updates both ways: UI ↔ Document
```

### 2. Read-Only Stores (GetROStore)
Unidirectional data flow from documents to UI.
```typescript
const essenceStore = storeManager.GetROStore<number>("attributes.essence", false);
// Updates one way: Document → UI
```

### 3. Derived Stores (GetSumROStore)
Computed values combining multiple stores.
```typescript
const totalStore = storeManager.GetSumROStore([baseStore, modStore]);
// Automatically sums all input stores
```

### 4. Shallow Stores (GetShallowStore)
In-memory UI state without document persistence.
```typescript
const expandedStore = storeManager.GetShallowStore<boolean>("sectionExpanded", false);
// Perfect for accordion state, tab selection, etc.
```

### 5. Flag Stores (GetFlagStore)
Persistent UI preferences stored in Foundry's flag system.
```typescript
const themeStore = storeManager.GetFlagStore<string>("theme", "dark");
// Persists to: document.flags.sr3e.theme
```

## Usage Pattern

### In Svelte Components

```typescript
import { onMount, onDestroy } from 'svelte';
import { StoreManager } from './utilities/StoreManager.svelte';

let storeManager: StoreManager;
let bodyStore;

onMount(() => {
  storeManager = StoreManager.Subscribe(actor);
  bodyStore = storeManager.GetRWStore<number>("attributes.body", false);
});

onDestroy(() => {
  StoreManager.Unsubscribe(actor);
});
```

### In Svelte Templates

```svelte
<input type="number" bind:value={$bodyStore} />
```

## Implementation Details

### Singleton Pattern
Each document has a single StoreManager instance shared across all subscribers. Reference counting ensures proper cleanup when the last subscriber disconnects.

### Muting Mechanism
When a store update triggers a document update, the path is temporarily muted to prevent the document's update hook from triggering a redundant store update (circular loop prevention).

### Non-Intrusive Updates
Document updates use `{ render: false }` to prevent unnecessary UI re-renders of the entire sheet, relying instead on Svelte's fine-grained reactivity.

### Hook Lifecycle
Hooks are registered on first subscription and cleaned up when subscriber count reaches zero, preventing memory leaks.

## Architecture

```
┌─────────────────┐
│  Svelte Store   │ ←─── UI binds to store
└────────┬────────┘
         │
         │ (subscribe)
         ↓
┌─────────────────┐
│  StoreManager   │ ←─── Manages lifecycle
└────────┬────────┘
         │
         │ (hooks)
         ↓
┌─────────────────┐
│ Foundry Document│ ←─── Source of truth
└─────────────────┘
```

## Best Practices

1. **Always unsubscribe** when components are destroyed to prevent memory leaks
2. **Use appropriate store types** for each use case (RW for editable, RO for computed)
3. **Leverage shallow stores** for UI state that shouldn't persist
4. **Use flag stores** for user preferences that should persist across sessions
5. **Share managers** by using the static Subscribe/Unsubscribe methods

## TypeScript Support

The StoreManager is fully typed with generics to ensure type safety:

```typescript
// Type-safe store creation
const bodyStore = storeManager.GetRWStore<number>("attributes.body");
const nameStore = storeManager.GetRWStore<string>("profile.name");
const skillsStore = storeManager.GetRWStore<SkillData[]>("skills");
```

## Testing

The `StoreManager.example.ts` file contains comprehensive usage examples demonstrating all store types and common patterns.
