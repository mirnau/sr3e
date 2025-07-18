import { writable, get, derived } from "svelte/store";
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
   shouldDisplaySheen: "shouldDisplaySheen",
   dicepoolSelection: "dicepoolSelection",
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
   #actorSubscriptions = {};

   constructor(document) {
      this.#document = document;
   }

   static Subscribe(document) {
      const documentId = document.id;

      if (storeManagers.has(documentId)) {
         const handlerData = storeManagers.get(documentId);
         handlerData.subscribers++;
         return handlerData.handler;
      }

      const handler = new StoreManager(document);
      storeManagers.set(documentId, { handler, subscribers: 1 });
      return handler;
   }

   static Unsubscribe(document) {
      const handlerData = storeManagers.get(document.id);
      if (!handlerData) return; // already cleaned up—just bail

      if (--handlerData.subscribers <= 0) {
         const manager = handlerData.handler;

         for (const disposer of manager.#hookDisposers.values()) disposer();
         manager.#hookDisposers.clear();
         manager.#persistentStore = {};
         manager.#actorStores = {};

         storeManagers.delete(document.id);
      }
   }
   GetRWStore(dataPath) {
      const fullPath = `system.${dataPath}`;
      const initial = foundry.utils.getProperty(this.#document.system, dataPath);

      if (!this.#persistentStore[dataPath]) {
         const cloned =
            initial && typeof initial === "object" ? (Array.isArray(initial) ? [...initial] : { ...initial }) : initial;

         const store = writable(cloned);
         let muted = false;

         const unsub = store.subscribe((v) => {
            if (muted) return;

            foundry.utils.setProperty(this.#document.system, dataPath, v);
            this.#document.update({ [fullPath]: v }, { render: false });
         });

         const docType = this.#document.documentName;
         const updateHook = (doc) => {
            if (doc.id !== this.#document.id) return;

            const newVal = foundry.utils.getProperty(doc.system, dataPath);
            muted = true;
            store.set(
               newVal && typeof newVal === "object" ? (Array.isArray(newVal) ? [...newVal] : { ...newVal }) : newVal
            );
            muted = false;
         };

         Hooks.on(`update${docType}`, updateHook);
         this.#hookDisposers.set(dataPath, () => {
            Hooks.off(`update${docType}`, updateHook);
            unsub();
         });

         this.#persistentStore[dataPath] = store;
      }

      return this.#persistentStore[dataPath];
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

export const modUpdateTick = writable(0);
