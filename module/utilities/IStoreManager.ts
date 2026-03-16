import type { Writable, Readable } from "svelte/store";

/**
 * Type representing any Foundry document (Actor, Item, etc.)
 * Using 'any' to support all Foundry document types flexibly
 */
export type FoundryDocument = any;

/**
 * Interface defining the contract for managing Svelte stores that synchronize with Foundry VTT documents.
 *
 * This interface enables seamless two-way data synchronization between Foundry's backend data model
 * and Svelte's reactive frontend components. The true singleton implementation handles lifecycle management,
 * hook registration/cleanup per document, and prevents circular update loops.
 */
export interface IStoreManager {
  /**
   * The Foundry document this store manager is bound to.
   * Note: In the singleton pattern, this getter is not used. Pass documents to methods instead.
   */
  readonly document: FoundryDocument;

  /**
   * Subscribes to store management for the given document.
   * Increments reference count and registers hooks on first subscription.
   *
   * @param document - The Foundry document to manage
   *
   * @example
   * ```typescript
   * const storeManager = StoreManager.Instance;
   * storeManager.Subscribe(actor);
   * ```
   */
  Subscribe(document: FoundryDocument): void;

  /**
   * Unsubscribes from store management for the given document.
   * Decrements reference count and cleans up resources when it reaches zero.
   *
   * @param document - The document to unsubscribe from
   *
   * @example
   * ```typescript
   * const storeManager = StoreManager.Instance;
   * storeManager.Unsubscribe(actor);
   * ```
   */
  Unsubscribe(document: FoundryDocument): void;

  /**
   * Creates a read-write store with bidirectional synchronization between Foundry and Svelte.
   * Changes to the store update the document, and document updates sync back to the store.
   *
   * @template T - The type of data stored
   * @param document - The Foundry document to synchronize with
   * @param dataPath - The path to the data within the document (e.g., "attributes.body")
   * @param isRoot - If true, uses the path as-is; if false, prepends "system." to the path
   * @returns A writable Svelte store synchronized with the document
   *
   * @example
   * ```typescript
   * const storeManager = StoreManager.Instance;
   * const bodyStore = storeManager.GetRWStore<number>(actor, "attributes.body", false);
   * // Reads from: actor.system.attributes.body
   * // Writes to: actor.update({"system.attributes.body": value}, {render: false})
   * ```
   */
  GetRWStore<T>(document: FoundryDocument, dataPath: string, isRoot?: boolean): Writable<T>;

  /**
   * Creates a read-only store that reflects document data but cannot be modified from the UI.
   * Listens to document updates and custom recalculation events.
   *
   * @template T - The type of data stored
   * @param document - The Foundry document to read from
   * @param dataPath - The path to the data within the document
   * @param isRoot - If true, uses the path as-is; if false, prepends "system." to the path
   * @returns A readable Svelte store that updates when the document changes
   *
   * @example
   * ```typescript
   * const storeManager = StoreManager.Instance;
   * const essenceStore = storeManager.GetROStore<number>(actor, "attributes.essence", false);
   * // Reads from: actor.system.attributes.essence
   * // Updates automatically when document changes
   * ```
   */
  GetROStore<T>(document: FoundryDocument, dataPath: string, isRoot?: boolean): Readable<T>;

  /**
   * Creates or retrieves a cached derived store that sums the `.value` and `.mod` fields
   * of a SimpleStat at the given logical data path.
   *
   * @param document - The Foundry document to read from
   * @param dataPath - The logical path to the SimpleStat (e.g., "attributes.body").
   *   The method internally reads `${dataPath}.value` and `${dataPath}.mod` — NOT `.modifier`.
   * @returns A readable store containing the sum of value + mod, cached per document+path
   *
   * @example
   * ```typescript
   * const storeManager = StoreManager.Instance;
   * const bodyStore = storeManager.GetSimpleStatROStore(actor, "attributes.body");
   * // Reads from: actor.system.attributes.body.value + actor.system.attributes.body.mod
   * // Result is cached — calling again with the same document+path returns the same store
   * ```
   */
  GetSimpleStatROStore(document: FoundryDocument, dataPath: string): Readable<number>;

  /**
   * Creates a shallow (non-persistent) store for transient UI state.
   * Data is stored in memory only and does not sync with Foundry documents.
   *
   * @template T - The type of data stored
   * @param document - The Foundry document this UI state is associated with
   * @param storeName - Unique identifier for this shallow store
   * @param initialValue - The initial value for the store
   * @returns A writable Svelte store that exists only in memory
   *
   * @example
   * ```typescript
   * const storeManager = StoreManager.Instance;
   * const expandedStore = storeManager.GetShallowStore<boolean>(actor, "sectionExpanded", false);
   * // Used for UI state like accordion expansion, tab selection, etc.
   * ```
   */
  GetShallowStore<T>(document: FoundryDocument, storeName: string, initialValue: T): Writable<T>;

  /**
   * Creates a store that persists data to Foundry's flag system.
   * Flags are stored in the document and persist across sessions.
   *
   * @template T - The type of data stored
   * @param document - The Foundry document to store the flag on
   * @param flagName - The name of the flag (will be stored under flags.sr3e.{flagName})
   * @param initialValue - The initial value if the flag doesn't exist
   * @returns A writable Svelte store synchronized with the document's flags
   *
   * @example
   * ```typescript
   * const storeManager = StoreManager.Instance;
   * const themeStore = storeManager.GetFlagStore<string>(actor, "theme", "dark");
   * // Reads from: actor.getFlag("sr3e", "theme")
   * // Writes to: actor.setFlag("sr3e", "theme", value)
   * ```
   */
  GetFlagStore<T>(document: FoundryDocument, flagName: string, initialValue: T): Writable<T>;
}
