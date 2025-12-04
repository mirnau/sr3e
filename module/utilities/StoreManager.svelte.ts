import { writable, derived } from "svelte/store";
import type { Writable, Readable } from "svelte/store";
import type { IStoreManager, FoundryDocument } from "./IStoreManager";

/**
 * StoreManager - Bridges Foundry VTT documents with Svelte reactive stores
 *
 * This is a true singleton class that manages the lifecycle of Svelte stores for ALL documents
 * in the game. It uses reference counting per document to ensure efficient resource management
 * and prevent memory leaks from hook registrations.
 *
 * Key features:
 * - Bidirectional data synchronization (Foundry ↔ Svelte)
 * - Automatic hook registration and cleanup per document
 * - Muting mechanism to prevent circular update loops
 * - Support for multiple store types (RW, RO, Derived, Shallow, Flag)
 * - Reference counting per document
 * - Single instance for the entire game
 */
export class StoreManager implements IStoreManager {
  static #instance: StoreManager | null = null;

  // Reference counting per document
  #documentSubscribers = new Map<string, number>();

  // Store maps keyed by `${uuid}:${path}` or `${uuid}:${storeName}`
  #rwStores = new Map<string, Writable<any>>();
  #roStores = new Map<string, Writable<any>>();
  #shallowStores = new Map<string, Writable<any>>();
  #flagStores = new Map<string, Writable<any>>();

  // Hook disposers per document
  #hookDisposers = new Map<string, Array<{ event: string; id: number }>>();

  // Muted paths per document
  #mutedPaths = new Set<string>();

  /**
   * Private constructor - use Instance static getter instead
   */
  private constructor() {}

  /**
   * Gets the singleton instance of StoreManager
   */
  static get Instance(): StoreManager {
    if (!StoreManager.#instance) {
      StoreManager.#instance = new StoreManager();
    }
    return StoreManager.#instance;
  }

  // IStoreManager compatibility - not used in true singleton pattern
  get document(): FoundryDocument {
    throw new Error("document getter not applicable for singleton StoreManager. Pass document to methods instead.");
  }

  /**
   * Subscribes to store management for the given document.
   * Increments reference count and registers hooks on first subscription.
   *
   * @param document - The Foundry document to manage
   */
  Subscribe(document: FoundryDocument): void {
    const docId = document.uuid;

    const currentCount = this.#documentSubscribers.get(docId) || 0;
    this.#documentSubscribers.set(docId, currentCount + 1);

    // Register hooks on first subscription
    if (currentCount === 0) {
      this.#registerHooks(document);
    }
  }

  /**
   * Unsubscribes from store management for the given document.
   * Decrements reference count and cleans up resources when it reaches zero.
   *
   * @param document - The document to unsubscribe from
   */
  Unsubscribe(document: FoundryDocument): void {
    const docId = document.uuid;
    const currentCount = this.#documentSubscribers.get(docId) || 0;

    if (currentCount <= 0) {
      console.warn(`No subscriptions found for document ${docId}`);
      return;
    }

    const newCount = currentCount - 1;
    this.#documentSubscribers.set(docId, newCount);

    if (newCount === 0) {
      this.#cleanup(document);
      this.#documentSubscribers.delete(docId);
    }
  }

  /**
   * Registers Foundry hooks for document updates
   */
  #registerHooks(document: FoundryDocument): void {
    const docId = document.uuid;
    const docType = document.documentName;
    const hooks: Array<{ event: string; id: number }> = [];

    // Hook for document updates
    const updateEvent = `update${docType}`;
    const updateHookId = Hooks.on(updateEvent, (doc: any, changes: any) => {
      if (doc.uuid !== docId) return;
      this.#handleDocumentUpdate(document, changes);
    });
    hooks.push({ event: updateEvent, id: updateHookId });

    // Hook for custom recalculation events (for actors)
    if (docType === "Actor") {
      const recalcEvent = "actorSystemRecalculated";
      const recalcHookId = Hooks.on(recalcEvent, (doc: any) => {
        if (doc.uuid !== docId) return;
        this.#handleDocumentUpdate(document, {});
      });
      hooks.push({ event: recalcEvent, id: recalcHookId });
    }

    this.#hookDisposers.set(docId, hooks);
  }

  /**
   * Handles document update events from Foundry
   * @param document - The document being updated
   * @param _changes - The changes object from Foundry's update hook (unused but kept for hook signature)
   */
  #handleDocumentUpdate(document: FoundryDocument, _changes: object): void {
    const docId = document.uuid;

    // Update all read-write stores for this document
    for (const [key, store] of this.#rwStores) {
      if (!key.startsWith(`${docId}:`)) continue;
      if (this.#mutedPaths.has(key)) continue;

      const path = key.substring(docId.length + 1);
      const value = this.#getValueAtPath(document, path);
      if (value !== undefined) {
        store.set(this.#cloneIfNeeded(value));
      }
    }

    // Update all read-only stores for this document
    for (const [key, store] of this.#roStores) {
      if (!key.startsWith(`${docId}:`)) continue;

      const path = key.substring(docId.length + 1);
      const value = this.#getValueAtPath(document, path);
      if (value !== undefined) {
        store.set(this.#cloneIfNeeded(value));
      }
    }

    // Update flag stores for this document
    for (const [key, store] of this.#flagStores) {
      if (!key.startsWith(`${docId}:`)) continue;

      const flagName = key.substring(docId.length + 1);
      const value = document.getFlag("sr3e", flagName);
      if (value !== undefined) {
        store.set(value);
      }
    }
  }

  /**
   * Cleans up all hooks and resources for a document
   */
  #cleanup(document: FoundryDocument): void {
    const docId = document.uuid;

    // Unregister all hooks for this document
    const hooks = this.#hookDisposers.get(docId);
    if (hooks) {
      for (const { event, id } of hooks) {
        Hooks.off(event, id);
      }
      this.#hookDisposers.delete(docId);
    }

    // Clear all stores for this document
    for (const key of this.#rwStores.keys()) {
      if (key.startsWith(`${docId}:`)) {
        this.#rwStores.delete(key);
      }
    }
    for (const key of this.#roStores.keys()) {
      if (key.startsWith(`${docId}:`)) {
        this.#roStores.delete(key);
      }
    }
    for (const key of this.#shallowStores.keys()) {
      if (key.startsWith(`${docId}:`)) {
        this.#shallowStores.delete(key);
      }
    }
    for (const key of this.#flagStores.keys()) {
      if (key.startsWith(`${docId}:`)) {
        this.#flagStores.delete(key);
      }
    }

    // Clear muted paths for this document
    for (const mutedPath of this.#mutedPaths) {
      if (mutedPath.startsWith(`${docId}:`)) {
        this.#mutedPaths.delete(mutedPath);
      }
    }
  }

  /**
   * Gets a value from the document at the specified path
   * @param document - The document to retrieve from
   * @param path - The path to retrieve (e.g., "system.attributes.body")
   * @returns The value at the path
   */
  #getValueAtPath(document: FoundryDocument, path: string): any {
    return foundry.utils.getProperty(document, path);
  }

  /**
   * Clones objects and arrays to trigger Svelte reactivity
   * @param value - The value to clone
   * @returns Cloned value if object/array, original value otherwise
   */
  #cloneIfNeeded(value: any): any {
    if (value === null || value === undefined) return value;
    if (typeof value === "object") {
      return Array.isArray(value) ? [...value] : { ...value };
    }
    return value;
  }

  /**
   * Normalizes a data path by prepending "system." if not a root path
   * @param dataPath - The path to normalize
   * @param isRoot - Whether this is a root path
   * @returns The normalized path
   */
  #normalizePath(dataPath: string, isRoot: boolean = false): string {
    return isRoot ? dataPath : `system.${dataPath}`;
  }

  /**
   * Creates or retrieves a read-write store with bidirectional synchronization
   */
  GetRWStore<T>(document: FoundryDocument, dataPath: string, isRoot: boolean = false): Writable<T> {
    const docId = document.uuid;
    const fullPath = this.#normalizePath(dataPath, isRoot);
    const key = `${docId}:${fullPath}`;

    if (this.#rwStores.has(key)) {
      return this.#rwStores.get(key)!;
    }

    const initialValue = this.#cloneIfNeeded(this.#getValueAtPath(document, fullPath));
    const store = writable<T>(initialValue);

    // Subscribe to store changes and sync to document
    store.subscribe((value) => {
      const currentValue = this.#getValueAtPath(document, fullPath);

      // Skip if value hasn't changed
      if (JSON.stringify(currentValue) === JSON.stringify(value)) return;

      // Mute this path to prevent circular updates
      this.#mutedPaths.add(key);

      // Update the document
      document.update({ [fullPath]: value }, { render: false }).finally(() => {
        // Unmute after a short delay
        setTimeout(() => {
          this.#mutedPaths.delete(key);
        }, 50);
      });
    });

    this.#rwStores.set(key, store);
    return store;
  }

  /**
   * Creates or retrieves a read-only store
   */
  GetROStore<T>(document: FoundryDocument, dataPath: string, isRoot: boolean = false): Readable<T> {
    const docId = document.uuid;
    const fullPath = this.#normalizePath(dataPath, isRoot);
    const key = `${docId}:${fullPath}`;

    if (this.#roStores.has(key)) {
      return this.#roStores.get(key)!;
    }

    const initialValue = this.#cloneIfNeeded(this.#getValueAtPath(document, fullPath));
    const store = writable<T>(initialValue);

    this.#roStores.set(key, store);
    return { subscribe: store.subscribe };
  }

  /**
   * Creates a derived store that sums multiple stores
   */
  GetSumROStore(stores: Writable<number>[]): Readable<number> {
    return derived(stores, ($values) => {
      return $values.reduce((sum, val) => sum + (val || 0), 0);
    });
  }

  /**
   * Creates or retrieves a shallow (non-persistent) store
   */
  GetShallowStore<T>(document: FoundryDocument, storeName: string, initialValue: T): Writable<T> {
    const key = `${document.uuid}:${storeName}`;

    if (this.#shallowStores.has(key)) {
      return this.#shallowStores.get(key)!;
    }

    const store = writable<T>(initialValue);
    this.#shallowStores.set(key, store);
    return store;
  }

  /**
   * Creates or retrieves a flag store that persists to Foundry's flag system
   */
  GetFlagStore<T>(document: FoundryDocument, flagName: string, initialValue: T): Writable<T> {
    const key = `${document.uuid}:${flagName}`;

    if (this.#flagStores.has(key)) {
      return this.#flagStores.get(key)!;
    }

    const currentValue = document.getFlag("sr3e", flagName);
    const store = writable<T>(currentValue !== undefined ? currentValue : initialValue);

    // Subscribe to store changes and sync to flags
    store.subscribe((value) => {
      const currentFlag = document.getFlag("sr3e", flagName);

      // Skip if value hasn't changed
      if (JSON.stringify(currentFlag) === JSON.stringify(value)) return;

      // Update the flag
      document.setFlag("sr3e", flagName, value);
    });

    this.#flagStores.set(key, store);
    return store;
  }
}

export default StoreManager;
