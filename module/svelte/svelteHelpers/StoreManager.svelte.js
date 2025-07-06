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
   #actorSubscriptions = {};

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
      const initial = foundry.utils.getProperty(this.#document.system, dataPath);

      if (!this.#persistentStore[dataPath]) {
         const cloned =
            initial && typeof initial === "object" ? (Array.isArray(initial) ? [...initial] : { ...initial }) : initial;

         const store = writable(cloned);
         let muted = false; // <- breaks the echo

         // UI -> Foundry
         const unsub = store.subscribe((v) => {
            if (muted) return; // ignore mirror updates
            foundry.utils.setProperty(this.#document.system, dataPath, v);
            this.#document.update({ [fullPath]: v }, { render: false });
         });

         // Foundry -> UI
         const docType = this.#document.documentName;
         const hook = (doc) => {
            if (doc.id !== this.#document.id) return;
            const v = foundry.utils.getProperty(doc.system, dataPath);
            muted = true;
            store.set(v && typeof v === "object" ? (Array.isArray(v) ? [...v] : { ...v }) : v);
            muted = false;
         };

         Hooks.on(`update${docType}`, hook);
         this.#hookDisposers.set(dataPath, () => {
            Hooks.off(`update${docType}`, hook);
            unsub();
         });

         this.#persistentStore[dataPath] = store;
      }

      return this.#persistentStore[dataPath];
   }

   GetROStore(dataPath) {
      const key = `RO:${dataPath}`;
      const initial = foundry.utils.getProperty(this.#document.system, dataPath);

      if (!this.#persistentStore[key]) {
         const store = writable(
            initial && typeof initial === "object" ? (Array.isArray(initial) ? [...initial] : { ...initial }) : initial
         );

         const docType = this.#document.documentName;
         const hook = (doc) => {
            if (doc.id !== this.#document.id) return;
            const v = foundry.utils.getProperty(doc.system, dataPath);
            store.set(v && typeof v === "object" ? (Array.isArray(v) ? [...v] : { ...v }) : v);
         };

         Hooks.on(`update${docType}`, hook);
         this.#hookDisposers.set(key, () => Hooks.off(`update${docType}`, hook));
         this.#persistentStore[key] = store;
      }

      return this.#persistentStore[key];
   }

   GetSumROStore(dataPath) {
      const value = this.GetRWStore(`${dataPath}.value`);
      const mod = this.GetROStore(`${dataPath}.mod`);

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

   //how to brodcast
   //const bc = manager.GetBroadcastStore(actor.id, "broadcasters", []);
   //bc.set(newMsgList);

   #triggerCallbacks(docId, name, value) {
      const subs = this.#actorSubscriptions[docId]?.[name];
      if (subs) subs.forEach((fn) => fn(value));
   }

   GetBroadcastStore(docId, storeName, initialValue = null) {
      this.GetShallowStore(docId, storeName, initialValue);
      const store = this.#actorStores[docId][storeName];

      return {
         subscribe: store.subscribe,
         set: (v) => {
            store.set(v);
            this.#triggerCallbacks(docId, storeName, v);
         },
         update: (fn) => {
            store.update(fn);
            this.#triggerCallbacks(docId, storeName, get(store));
         },
         onBroadcast: (cb) => {
            this.#actorSubscriptions[docId] ??= {};
            this.#actorSubscriptions[docId][storeName] ??= [];
            this.#actorSubscriptions[docId][storeName].push(cb);
            return () => {
               this.#actorSubscriptions[docId][storeName] = this.#actorSubscriptions[docId][storeName].filter(
                  (fn) => fn !== cb
               );
            };
         },
      };
   }
}
