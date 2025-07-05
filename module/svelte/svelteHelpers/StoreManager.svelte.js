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
   isrollcomposeropen: "isrollcomposeropen",
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
   #hookDisposers = new Map();

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
         const manager = handlerData.handler;

         for (const [dataPath, disposer] of manager.#hookDisposers.entries()) {
            disposer();
         }

         manager.#hookDisposers.clear();
         manager.#persistentStore = {};

         storeManagers.delete(document.id);
      }
   }

   GetRWStore(dataPath) {
      const fullPath = `system.${dataPath}`;
      const value = foundry.utils.getProperty(this.#document.system, dataPath);

      if (!this.#persistentStore[dataPath]) {
         const clonedValue =
            value && typeof value === "object" ? (Array.isArray(value) ? [...value] : { ...value }) : value;

         const store = writable(clonedValue);

         // -- Svelte → Foundry sync --
         const unsubscribe = store.subscribe((newValue) => {
            foundry.utils.setProperty(this.#document.system, dataPath, newValue);
            this.#document.update({ [fullPath]: newValue }, { render: false });
         });

         // -- Foundry → Svelte sync --
         const docUpdateHook = (doc) => {
            if (doc.id !== this.#document.id) return;
            const newValue = foundry.utils.getProperty(doc.system, dataPath);
            store.set(
               newValue && typeof newValue === "object"
                  ? Array.isArray(newValue)
                     ? [...newValue]
                     : { ...newValue }
                  : newValue
            );
         };

         const docType = this.#document.documentName;
         Hooks.on(`update${docType}`, docUpdateHook);

         // Register cleanup
         this.#hookDisposers.set(dataPath, () => {
            Hooks.off(`update${docType}`, docUpdateHook);
            unsubscribe();
         });

         this.#persistentStore[dataPath] = store;
      }

      return this.#persistentStore[dataPath];
   }

   GetSumROStore(dataPath) {
      const value = this.GetRWStore(`${dataPath}.value`);
      const mod = this.GetRWStore(`${dataPath}.mod`);

      const total = derived([value, mod], ([$value, $mod]) => ({
         value: $value,
         mod: $mod,
         sum: $value + $mod,
      }));

      return total;
   }

   GetShallowStore(docId, storeName, customValue = null) {
      this.#actorStores[docId] ??= {};

      if (!this.#actorStores[docId][storeName]) {
         let value = customValue;

         if (value && typeof value === "object") {
            value = Array.isArray(value) ? [...value] : { ...value };
         }

         this.#actorStores[docId][storeName] = writable(value);
      }

      return this.#actorStores[docId][storeName];
   }

   GetFlagStore(flag) {
      if (!this.#persistentStore[flag]) {
         const currentValue = this.#document.getFlag(flags.sr3e, flag);

         const store = writable(currentValue);

         store.subscribe((newValue) => {
            this.#document.update(
               {
                  [`flags.${flags.sr3e}.${flag}`]: newValue,
               },
               { render: false }
            );
         });

         this.#persistentStore[flag] = store;
      }

      return this.#persistentStore[flag];
   }
}
