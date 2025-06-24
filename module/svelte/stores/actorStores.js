import { writable } from 'svelte/store';

const documentStore = {};
const actorStores = {};

export const stores = {
  intelligence: "intelligence",
  attributePoints: "attributePoints",
  activePoints: "activePoints",
  knowledgePoints: "knowledgePoints",
  languagePoints: "languagePoints",
  attributeAssignmentLocked: "attributeAssignmentLocked",
  actorName: "actorName",
  isShoppingState: "isShoppingState",
  activeSkillsIds: "activeSkillsIds",
  knowledgeSkillsIds: "knowledgeSkillsIds",
  languageSkillsIds: "languageSkillsIds",
  isCharacterCreation: "isCharacterCreation",
  initiativeDice: "initiativeDice",
  baseInitiative: "baseInitiative",
  combat: {
    stunDamage: "stunDamage",
    leathalDamage: "leathalDamage",
    penalty: "penalty",
    overflow: "overflow"

  }
}


export function getActorStore(actorId, storeName, customValue = null) {
  actorStores[actorId] ??= {};

  if (!actorStores[actorId][storeName]) {
    let value = customValue;

    if (value && typeof value === 'object') {
      value = Array.isArray(value) ? [...value] : { ...value };
    }

    actorStores[actorId][storeName] = writable(value);
  }

  return actorStores[actorId][storeName];
}




import { writable } from "svelte/store";

const documentStore = {};

/**
 * Retrieves or creates a Svelte writable store for a specific data path on a document.
 *
 * @param {object} document - The document object to update and associate with the store.
 * @param {string} dataPath - The path within the document's data to update and store.
 * @param {*} initialValue - The value to set at the specified data path and initialize the store with, if created.
 * @returns {import('svelte/store').Writable<any>} - A Svelte writable store for the specified data path.
 */
export function getStore(document, dataPath, initialValue) {
  const docId = document.id ?? document._id;

  // Ensure the document's store object exists
  documentStore[docId] ??= {};

  // If the store for this data path doesn't exist, create it
  if (!documentStore[docId][dataPath]) {
    let value = initialValue;

    // If the value is an object or array, clone it to avoid reference issues
    if (value && typeof value === "object") {
      value = Array.isArray(value) ? [...value] : { ...value };
    }

    // Update the document with the initial value without re-rendering
    document.update({ [dataPath]: initialValue }, { render: false });

    // Create the writable store and store it
    documentStore[docId][dataPath] = writable(value);
  }

  // Return the existing or newly created store
  return documentStore[docId][dataPath];
}