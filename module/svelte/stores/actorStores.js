import { writable } from 'svelte/store';

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
  isCharacterCreation: "isCharacterCreation"
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

export function removeActorStore(actorId, storeName) {
  if (actorStores[actorId] && actorStores[actorId][storeName]) {
    delete actorStores[actorId][storeName];
  }
}