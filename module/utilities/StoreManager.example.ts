/**
 * Example usage of StoreManager with Foundry VTT documents
 *
 * This file demonstrates how to use the StoreManager utility to create
 * reactive Svelte stores that synchronize with Foundry documents.
 *
 * NOTE: This is an example file for reference only.
 */

import { StoreManager } from "./StoreManager.svelte";

/**
 * Example: Using StoreManager in a Svelte component
 *
 * This would typically be called in a Svelte component's onMount or constructor
 */
export function exampleStoreManagerUsage(actor: Actor) {
  // Get the singleton instance
  const storeManager = StoreManager.Instance;

  // Subscribe to store management for this actor
  storeManager.Subscribe(actor);

  // Create a read-write store for an editable attribute
  // This creates bidirectional sync: UI changes update the document,
  // and document changes update the UI
  const bodyStore = storeManager.GetRWStore<number>(actor, "attributes.body", false);
  // Reads from: actor.system.attributes.body
  // Writes to: actor.update({"system.attributes.body": value})

  // Create a read-only store for a computed value
  // This only syncs FROM the document TO the UI (one-way)
  storeManager.GetROStore<number>(actor, "attributes.essence", false);
  // Reads from: actor.system.attributes.essence
  // Updates automatically when document changes

  // Create a derived store that combines multiple values
  const strengthModStore = storeManager.GetRWStore<number>(actor, "attributes.strengthMod", false);
  storeManager.GetSumROStore([bodyStore, strengthModStore]);
  // totalStrengthStore = bodyStore + strengthModStore

  // Create a shallow store for UI state (not persisted to document)
  storeManager.GetShallowStore<boolean>(actor, "skillsExpanded", true);
  // This is just in-memory state, useful for accordion UI, etc.

  // Create a flag store for persistent UI preferences
  storeManager.GetFlagStore<string>(actor, "preferredTheme", "dark");
  // Reads from: actor.getFlag("sr3e", "preferredTheme")
  // Writes to: actor.setFlag("sr3e", "preferredTheme", value)

  // Use the stores in Svelte components
  // In a .svelte file, you would do:
  // <input type="number" bind:value={$bodyStore} />
  // <div class="essence">Essence: {$essenceStore}</div>
  // <div class="total">Total Strength: {$totalStrengthStore}</div>

  // When the component is destroyed, unsubscribe
  // This is typically called in Svelte's onDestroy hook
  return () => {
    storeManager.Unsubscribe(actor);
  };
}

/**
 * Example: Using StoreManager in a Foundry Application class
 */
export class ExampleActorSheet extends ActorSheet {
  #storeManager = StoreManager.Instance;

  async _render(force?: boolean, options?: Application.RenderOptions<ActorSheet.Options>) {
    await super._render(force, options);

    // Subscribe to store manager when sheet is rendered
    if (this.actor) {
      this.#storeManager.Subscribe(this.actor);
    }
  }

  async close(options?: Application.CloseOptions) {
    // Unsubscribe when sheet is closed
    if (this.actor) {
      this.#storeManager.Unsubscribe(this.actor);
    }

    return super.close(options);
  }

  getData(options?: Partial<ActorSheet.Options>) {
    const baseData = super.getData(options);

    if (!this.actor) {
      return baseData;
    }

    // Create stores for use in templates
    const stores = {
      body: this.#storeManager.GetRWStore<number>(this.actor, "attributes.body", false),
      quickness: this.#storeManager.GetRWStore<number>(this.actor, "attributes.quickness", false),
      strength: this.#storeManager.GetRWStore<number>(this.actor, "attributes.strength", false),
    };

    return {
      ...baseData,
      stores,
    };
  }
}

/**
 * Example: Reference counting demonstration
 *
 * This shows how multiple subscribers share the same StoreManager singleton instance
 */
export function exampleReferenceCounting(actor: Actor) {
  // Get the singleton instance
  const storeManager = StoreManager.Instance;

  // First subscriber
  storeManager.Subscribe(actor);
  // Hooks are registered here (subscriber count = 1)

  // Second subscriber to the same actor
  storeManager.Subscribe(actor);
  // No new hooks registered, just increment count (subscriber count = 2)

  // Get stores for this actor - they're keyed by document UUID
  storeManager.GetRWStore<number>(actor, "attributes.body", false);
  storeManager.GetRWStore<number>(actor, "attributes.body", false);
  // Both calls return the same store instance for the same document:path

  // First unsubscribe
  storeManager.Unsubscribe(actor);
  // Subscriber count = 1, hooks still active

  // Second unsubscribe
  storeManager.Unsubscribe(actor);
  // Subscriber count = 0, hooks cleaned up, stores for this document removed
}

/**
 * Example: Multiple documents in the same singleton
 */
export function exampleMultipleDocuments(actor1: Actor, actor2: Actor) {
  const storeManager = StoreManager.Instance;

  // Subscribe to both actors
  storeManager.Subscribe(actor1);
  storeManager.Subscribe(actor2);

  // Create stores for both actors - they're all managed by the same singleton
  storeManager.GetRWStore<number>(actor1, "attributes.body", false);
  storeManager.GetRWStore<number>(actor2, "attributes.body", false);

  // These are different stores, tied to different documents
  // When actor1 updates, only its stores update
  // When actor2 updates, only its stores update

  // Cleanup
  return () => {
    storeManager.Unsubscribe(actor1);
    storeManager.Unsubscribe(actor2);
  };
}
