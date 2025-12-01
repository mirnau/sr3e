import { writable, derived, type Writable, type Readable } from "svelte/store";
import { flags } from "@services/commonConsts.js";

/**
 * Type for Foundry VTT documents (Actor or Item)
 */
interface FoundryDocument {
   id: string;
   documentName: string;
   system: Record<string, any>;
   getFlag(namespace: string, key: string): any;
   update(data: Record<string, any>, options?: { render?: boolean }): Promise<this>;
}

/**
 * Handler data stored in the global storeManagers map
 */
interface StoreManagerHandlerData {
   handler: StoreManager;
   subscribers: number;
}

/**
 * Store registry map: document ID -> handler data
 */
const storeManagers = new Map<string, StoreManagerHandlerData>();

/**
 * Constant keys for available stores
 */
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
} as const;

/**
 * Type for the sum store object returned by GetSumROStore
 */
interface SumStoreValue {
   value: number;
   mod: number;
   sum: number;
}

/**
 * Type for hook disposer functions
 */
type HookDisposer = () => void;

/**
 * Manager for Svelte stores tied to Foundry VTT documents.
 * Handles creation, subscription, and cleanup of reactive stores.
 */
export class StoreManager {
   #document: FoundryDocument;
   #persistentStore: Record<string, Writable<any>> = {};
   #actorStores: Record<string, Record<string, Writable<any>>> = {};
   #hookDisposers = new Map<string, HookDisposer>();
   /** @private Reserved for future use */
   // @ts-expect-error - Reserved for future use
   #actorSubscriptions: Record<string, any> = {};

   constructor(document: FoundryDocument) {
      this.#document = document;
   }

   /**
    * Subscribe to a document's StoreManager (or create one if needed).
    * Uses reference counting to share manager instances.
    */
   static Subscribe(document: FoundryDocument): StoreManager {
      const documentId = document.id;

      if (storeManagers.has(documentId)) {
         const handlerData = storeManagers.get(documentId)!;
         handlerData.subscribers++;
         return handlerData.handler;
      }

      const handler = new StoreManager(document);
      storeManagers.set(documentId, { handler, subscribers: 1 });
      return handler;
   }

   /**
    * Unsubscribe from a document's StoreManager.
    * When subscriber count reaches zero, cleans up all hooks and stores.
    */
   static Unsubscribe(document: FoundryDocument): void {
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

   /**
    * Get or create a read-write store for a document property.
    * Syncs bidirectionally with the document's data.
    *
    * @param dataPath - Property path (e.g., "attributes.body")
    * @param isRoot - If true, path is relative to document root; otherwise relative to system
    * @returns A writable Svelte store
    */
   GetRWStore<T = any>(dataPath: string, isRoot = false): Writable<T> {
      const fullPath = isRoot ? dataPath : `system.${dataPath}`;
      const initial = foundry.utils.getProperty(isRoot ? this.#document : this.#document.system, dataPath);

      if (!this.#persistentStore[fullPath]) {
         const cloned =
            initial && typeof initial === "object" ? (Array.isArray(initial) ? [...initial] : { ...initial }) : initial;

         const store = writable<T>(cloned);
         let muted = false;

         const unsub = store.subscribe((v) => {
            if (muted) return;
            foundry.utils.setProperty(isRoot ? this.#document : this.#document.system, dataPath, v);
            this.#document.update({ [fullPath]: v }, { render: false });
         });

         const docType = this.#document.documentName;
         const hook = (doc: FoundryDocument) => {
            if (doc.id !== this.#document.id) return;
            const v = foundry.utils.getProperty(isRoot ? doc : doc.system, dataPath);
            muted = true;
            store.set(v && typeof v === "object" ? (Array.isArray(v) ? [...v] : { ...v }) : v);
            muted = false;
         };

         Hooks.on(`update${docType}`, hook);
         this.#hookDisposers.set(fullPath, () => {
            Hooks.off(`update${docType}`, hook);
            unsub();
         });

         this.#persistentStore[fullPath] = store;
      }

      return this.#persistentStore[fullPath] as Writable<T>;
   }

   /**
    * Get or create a read-only store for a document property.
    * Updates automatically when the document changes, but changes to the store don't propagate back.
    *
    * @param dataPath - Property path relative to document.system
    * @returns A writable store (writable for internal updates, but treat as read-only externally)
    */
   GetROStore<T = any>(dataPath: string): Writable<T> {
      const key = `RO:${dataPath}`;
      const initial = foundry.utils.getProperty(this.#document.system, dataPath);

      if (!this.#persistentStore[key]) {
         const store = writable<T>(
            initial && typeof initial === "object" ? (Array.isArray(initial) ? [...initial] : { ...initial }) : initial
         );

         const docType = this.#document.documentName;

         const updateHook = (doc: FoundryDocument) => {
            if (doc.id !== this.#document.id) return;
            const v = foundry.utils.getProperty(doc.system, dataPath);
            store.set(v && typeof v === "object" ? (Array.isArray(v) ? [...v] : { ...v }) : v);
         };

        const recalcHook = (actor: FoundryDocument | null) => {
           if (!actor || actor.id !== this.#document.id) return;
           const v = foundry.utils.getProperty(actor.system, dataPath);
           store.set(v && typeof v === "object" ? (Array.isArray(v) ? [...v] : { ...v }) : v);
        };

         Hooks.on(`update${docType}`, updateHook);
         Hooks.on("actorSystemRecalculated", recalcHook);

         this.#hookDisposers.set(key, () => {
            Hooks.off(`update${docType}`, updateHook);
            Hooks.off("actorSystemRecalculated", recalcHook);
         });

         this.#persistentStore[key] = store;
      }

      return this.#persistentStore[key] as Writable<T>;
   }

   /**
    * Get a derived store that combines .value and .mod into a sum.
    *
    * @param dataPath - Base path to object with .value and .mod properties
    * @returns A derived store with { value, mod, sum }
    */
   GetSumROStore(dataPath: string): Readable<SumStoreValue> {
      const value = this.GetRWStore<number>(`${dataPath}.value`);
      //const mod = this.GetRWStore(`${dataPath}.mod`); //Causes an infinite loop balooning .mod
      const mod = this.GetROStore<number>(`${dataPath}.mod`); //Renders .mod stale, and preventes reactive updates

      const total = derived([value, mod], ([$value, $mod]) => ({
         value: $value,
         mod: $mod,
         sum: $value + $mod,
      }));

      return total;
   }

   /**
    * Get or create a shallow (non-persistent) store.
    * These stores are scoped by document ID and store name, but don't sync with the document.
    *
    * @param docId - Document ID to scope this store to
    * @param storeName - Name/key for this store
    * @param customValue - Initial value (default: null)
    * @returns A writable Svelte store
    */
   GetShallowStore<T = any>(docId: string, storeName: string, customValue: T | null = null): Writable<T | null> {
      this.#actorStores[docId] ??= {};

      if (!this.#actorStores[docId]![storeName]) {
         let value: T | null = customValue;

         if (value && typeof value === "object") {
            value = (Array.isArray(value) ? [...value] : { ...value }) as T;
         }

         this.#actorStores[docId]![storeName] = writable<T | null>(value);
      }

      return this.#actorStores[docId]![storeName] as Writable<T | null>;
   }

   /**
    * Get or create a store for a document flag.
    * Syncs bidirectionally with the document's flags.
    *
    * @param flag - Flag key (under flags.sr3e.*)
    * @returns A writable Svelte store
    */
   GetFlagStore<T = any>(flag: string): Writable<T> {
      if (!this.#persistentStore[flag]) {
         const currentValue = this.#document.getFlag(flags.sr3e, flag) as T;

         const store = writable<T>(currentValue);

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

      return this.#persistentStore[flag] as Writable<T>;
   }
}

/**
 * Global tick counter for tracking when modifiers are updated.
 * Used to trigger reactive updates across the system.
 */
export const modUpdateTick = writable<number>(0);
