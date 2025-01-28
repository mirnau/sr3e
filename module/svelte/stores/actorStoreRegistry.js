// src/stores/actorStoreRegistry.js
import { writable } from "svelte/store";

// Global registry for all actor stores
const actorStores = new Map();

/**
 * Get or create a store for a specific actor
 */
export function getActorStore(actorId, actorName) {
    let initialState = { name: actorName }
    if (!actorStores.has(actorId)) {
        // Initialize the store with an object
        actorStores.set(actorId, writable(initialState));
    }
    return actorStores.get(actorId); // Return the writable store
}


/**
 * Remove an actor's store when it's no longer needed
 */
export function removeActorStore(actorId) {
    actorStores.delete(actorId);
}
