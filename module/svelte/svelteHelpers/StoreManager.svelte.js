import { writable, derived } from "svelte/store";
import { flags } from "../../services/commonConsts.js";

const storeManagers = new Map();

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
      overflow: "overflow",
   },
};

export class StoreManager {
   #document;
   #persistentStore = {};
   #actorStores = {};

   constructor(document) {
      this.#document = document;
   }

   static Subscribe(document) {
      if (storeManagers.has(document.id)) {
         const handlerData = storeManagers.get(document.id);
         handlerData.subscribers++;
         return handlerData.handler;
      }

      const handler = new StoreManager(document);
      storeManagers.set(document.id, { handler, subscribers: 1 });
      return handler;
   }

   static Unsubscribe(document) {
      const handlerData = storeManagers.get(document.id);
      handlerData.subscribers--;

      if (handlerData.subscribers < 1) {
         storeManagers.delete(document.id);
      }
   }

   GetStore(dataPath) {
      const fullPath = `system.${dataPath}`;
      const value = foundry.utils.getProperty(this.#document.system, dataPath);

      if (!this.#persistentStore[dataPath]) {
         const clonedValue =
            value && typeof value === "object" ? (Array.isArray(value) ? [...value] : { ...value }) : value;

         const store = writable(clonedValue);

         store.subscribe((newValue) => {
            foundry.utils.setProperty(this.#document.system, dataPath, newValue);
            this.#document.update({ [fullPath]: newValue }, { render: false });
         });

         this.#persistentStore[dataPath] = store;
      }

      return this.#persistentStore[dataPath];
   }

   GetShallowStore(actorId, storeName, customValue = null) {
      this.#actorStores[actorId] ??= {};

      if (!this.#actorStores[actorId][storeName]) {
         let value = customValue;

         if (value && typeof value === "object") {
            value = Array.isArray(value) ? [...value] : { ...value };
         }

         this.#actorStores[actorId][storeName] = writable(value);
      }

      return this.#actorStores[actorId][storeName];
   }

   GetFlagStore(flag) {
      if (!this.#persistentStore[flag]) {
         const currentValue = this.#document.getFlag(flags.sr3e, flag);

         const store = writable(currentValue);

         store.subscribe((newValue) => {
            this.#document.setFlag(flags.sr3e, flag, newValue);
         });

         this.#persistentStore[flag] = store;
      }

      return this.#persistentStore[flag];
   }

   /**
    * Creates a derived Svelte store that combines multiple stores into a single object.
    * Each key in the resulting object corresponds to a store value, and an additional `sum` property
    * contains the sum of all store values.
    *
    * @param {string} basePath - The base path used to retrieve individual stores.
    * @param {string[]} keys - An array of keys to identify which stores to combine.
    * @returns {import('svelte/store').Readable<Object>} A derived Svelte store object with each key's value and a `sum` property.
    */
   GetCompositeStore(basePath, keys) {
      const stores = keys.map((key) => this.GetStore(`${basePath}.${key}`));

      return derived(stores, ($stores) => {
         const obj = {};
         let sum = 0;

         keys.forEach((key, i) => {
            obj[key] = $stores[i];
            sum += $stores[i];
         });

         obj.sum = sum;
         return obj;
      });
   }
}
