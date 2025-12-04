<objective>
Implement a StoreManager utility class for this Foundry VTT system that bridges Foundry's document system with Svelte's reactive stores. This utility enables seamless two-way data synchronization between Foundry's backend data model and Svelte's reactive frontend components, ensuring the UI remains responsive while keeping backend data fresh and synchronized.

This implementation will replace/modernize the existing StoreManager pattern and must work within a TypeScript environment with strict type checking enabled.
</objective>

<requirements>
1. Create an interface (IStoreManager) that defines the contract for store management operations
   - This interface ensures future implementations can be swapped without breaking existing code
   - Must support all store types: ReadWrite, ReadOnly, Derived, Shallow, and Flag stores

2. Implement a concrete StoreManager class that implements the IStoreManager interface
   - Use singleton pattern with reference counting (Map-based tracking by document ID)
   - Support Subscribe() and Unsubscribe() static methods for lifecycle management
   - Clean up resources when subscriber count reaches zero

3. Support multiple store types with distinct behaviors:
   - **ReadWrite stores (GetRWStore)**: Bidirectional sync between Foundry documents and Svelte
     - Accept optional `isRoot` flag for path resolution (defaults to `system.${dataPath}`)
     - Clone objects/arrays to prevent unintended mutations
     - Use `render: false` on document updates to prevent unnecessary re-renders
     - Implement muting mechanism to prevent circular update loops
     - Register `update${docType}` hooks with proper cleanup

   - **ReadOnly stores (GetROStore)**: Unidirectional data flow from documents to UI
     - Listen to both `update${docType}` and custom `actorSystemRecalculated` events
     - Prevent accidental mutations from UI layer

   - **Derived stores (GetSumROStore)**: Computed properties using Svelte's derived()
     - Combine multiple writable stores into computed values
     - Example: sum of base value + modifier

   - **Shallow stores (GetShallowStore)**: In-memory UI state without persistence
     - Organized by document ID and store name
     - Support custom initial values
     - No Foundry synchronization

   - **Flag stores (GetFlagStore)**: Persist UI state to Foundry's flag system
     - Read from `document.getFlag(flags.sr3e, flagName)`
     - Sync changes via update() with proper flag path construction
     - Maintain single instance per flag

4. Implement proper TypeScript typing:
   - Use generics where appropriate to maintain type safety
   - Properly type Foundry document references
   - Type all store return values correctly for Svelte's store contract
   - Ensure strict null checking compliance

5. Lifecycle and cleanup:
   - Store hook disposer functions in private field (#hookDisposers)
   - Unregister all hooks during Unsubscribe() to prevent memory leaks
   - Properly clean up shared store instances when no subscribers remain

6. File structure:
   - Save interface as: C:\Users\mikae\AppData\Local\FoundryVTT\Data\systems\sr3e\module\utilities\IStoreManager.ts
   - Save implementation as: C:\Users\mikae\AppData\Local\FoundryVTT\Data\systems\sr3e\module\utilities\StoreManager.svelte.js (note the .svelte.js extension for Svelte integration)
</requirements>

<implementation>
Use the previous implementation from https://github.com/mirnau/sr3e/blob/main/module/svelte/svelteHelpers/StoreManager.svelte.js as a reference for patterns and architecture.

Key patterns to preserve:
- Singleton manager instances per document with reference counting
- Muting mechanism to prevent circular updates (Foundry→Store→Foundry loops)
- Data cloning strategy for objects/arrays to trigger Svelte reactivity
- Non-intrusive updates using `render: false` flag
- Hook lifecycle management with disposer functions
- Lazy store initialization (only create when requested)

Modernize for TypeScript:
- Convert class to TypeScript with proper typing
- Use TypeScript private fields (#field syntax) instead of WeakMaps where appropriate
- Add JSDoc comments for public API methods
- Use proper Foundry VTT type definitions from @league-of-foundry-developers/foundry-vtt-types
- Ensure strict mode compliance (strict: true in tsconfig.json)

Path structure considerations:
- The project uses `module/utilities/` for utility classes
- No files currently exist in this directory, so this will establish the pattern
- Interface-based design allows for future alternate implementations or testing mocks

Why these constraints matter:
- Interface separation enables testing with mock implementations and future refactoring without breaking changes
- The .svelte.js extension ensures proper handling by the Svelte compiler while maintaining JavaScript compatibility
- Singleton with reference counting prevents duplicate hook registrations and memory leaks
- Muting mechanism is critical to prevent infinite update loops in bidirectional data binding
- Non-intrusive updates (render: false) prevent unnecessary UI re-renders and performance issues
</implementation>

<context>
Project environment:
- TypeScript with strict mode enabled (target: ES2022, module: ESNext)
- Svelte integration for UI components
- Foundry VTT game system (uses Foundry's document model and hooks system)
- Uses @league-of-foundry-developers/foundry-vtt-types for Foundry type definitions

Reference implementation analysis:
The previous StoreManager used a Map to track active managers by document ID, with each entry containing {handler, subscribers}. Multiple subscribers to the same document share one manager instance. The implementation provided different store types for different use cases:
- Bidirectional sync for user-editable fields (ReadWrite)
- One-way sync for computed/derived values (ReadOnly)
- Composite stores combining multiple values (Derived)
- Transient UI state (Shallow)
- Persisted UI state (Flags)

This pattern successfully decouples Svelte components from Foundry's document model while maintaining automatic synchronization.
</context>

<success_criteria>
1. IStoreManager interface is created with complete type definitions for all store methods
2. StoreManager class implements the IStoreManager interface completely
3. All five store types are implemented with correct behavior:
   - GetRWStore: Bidirectional synchronization working
   - GetROStore: Unidirectional synchronization working
   - GetSumROStore: Derived store combining multiple sources
   - GetShallowStore: In-memory non-persistent state
   - GetFlagStore: Foundry flag persistence working
4. TypeScript compilation succeeds with no errors (strict mode enabled)
5. Proper lifecycle management: hooks registered on Subscribe(), cleaned up on Unsubscribe()
6. Reference counting works correctly (shared instances, cleanup at zero subscribers)
7. Muting mechanism prevents circular update loops
8. Code includes clear JSDoc comments explaining the public API
9. Both files saved to correct locations:
   - C:\Users\mikae\AppData\Local\FoundryVTT\Data\systems\sr3e\module\utilities\IStoreManager.ts
   - C:\Users\mikae\AppData\Local\FoundryVTT\Data\systems\sr3e\module\utilities\StoreManager.svelte.js
</success_criteria>

<verification>
After implementation:
1. Run TypeScript compiler to verify no type errors: `npx tsc --noEmit`
2. Verify both files exist at the specified paths
3. Check that IStoreManager exports all necessary method signatures
4. Confirm StoreManager properly implements IStoreManager interface
5. Visually inspect the implementation to ensure:
   - All five store types are present
   - Hook registration and cleanup code is in place
   - Muting mechanism is implemented
   - Reference counting logic is correct
   - TypeScript types are properly defined
</verification>
