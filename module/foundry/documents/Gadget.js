import GadgetModel from "@models/gadget/GadgetModel.js";
import GadgetSheet from "@sheets/GadgetSheet.js";
import { flags } from "@services/commonConsts.js";

export default class Gadget extends foundry.abstract.Document {
   constructor(data = {}, context = {}) {
      super(data, context); // ← this handles parent assignment internally

      this.apps = {};
   }

   static get metadata() {
      return {
         name: "Gadget",
         label: "Gadget",
         labelPlural: "Gadgets",
         collection: "gadgets", // symbolic only
         isEmbedded: true,
         embedded: {
            ActiveEffect: "effects",
         },
         hasSystemData: true,
         permissions: { create: "ITEM_CREATE" },
      };
   }

   get effects() {
      return this._getEmbeddedCollection("ActiveEffect");
   }

   get id() {
      return this._source._id;
   }

   static Register() {
      CONFIG.Gadget = foundry.utils.mergeObject(
         CONFIG.Gadget ?? {},
         {
            documentClass: Gadget,
            dataModels: {
               weaponmod: GadgetModel,
            },
            embedded: {
               ActiveEffect: "effects",
            },
            sheetClasses: {
               weaponmod: {
                  id: "sr3e.gadget.weaponmod",
                  label: "Gadget Sheet",
                  types: ["weaponmod"],
                  cls: GadgetSheet,
                  default: true,
               },
            },
         },
         { inplace: true }
      );

      // Optional debug logging
      Hooks.once("ready", () => {
         console.log(">>> CONFIG.Gadget at ready", CONFIG.Gadget);
      });
   }

   static defineSchema() {
      return GadgetModel.defineSchema();
   }

   get documentName() {
      return "Gadget";
   }

   get uuid() {
      if (!this._uuid) {
         const id = this.id ?? this._source?._id ?? foundry.utils.randomID();
         this._uuid = `Gadget.${id}`;
      }
      return this._uuid;
   }

   set effects(value) {
      this._effects = undefined;

      if (value instanceof foundry.utils.Collection) value = Array.from(value.values());

      if (Array.isArray(value)) {
         this._source.effects = value.map((e) => {
            if (typeof e.toObject === "function") return e.toObject();
            return structuredClone(e);
         });
      } else {
         throw new TypeError("Gadget.effects must be an array or Collection of effects.");
      }
   }

   get sheet() {
      console.log("Gadget type check", this.constructor.name, this instanceof Gadget);
      console.log("Gadget.get sheet(): type =", this.type);
      console.log("Gadget.js from instance:", import.meta.url);
      console.log("CONFIG.Gadget", CONFIG.Gadget);

      if (!this._sheet) {
         const entry = CONFIG.Gadget?.sheetClasses?.[this.type];
         const SheetClass = entry?.cls;

         if (!SheetClass) {
            throw new Error(`No sheet registered for Gadget subtype '${this.type}'`);
         }

         console.log("Gadget type check", this.constructor.name, this instanceof Gadget);

         this._sheet = new SheetClass({
            document: this,
            editable: true,
            id: `gadget-sheet-${this.id}`,
         });
      }

      return this._sheet;
   }

   async createEmbeddedDocuments(embeddedName, data, context = {}) {
      if (embeddedName !== "ActiveEffect") throw new Error(`Unsupported embedded type: ${embeddedName}`);
      const parentItem = this.parent;
      if (!parentItem) throw new Error("Cannot create ActiveEffects — Gadget has no parent");

      const incoming = Array.isArray(data) ? data : [data];
      const current = this._source.effects ?? [];

      const newEffects = incoming.map((d) => {
         const clone = foundry.utils.deepClone(d);
         clone._id ??= foundry.utils.randomID();
         return clone;
      });

      const updated = [...current, ...newEffects];

      const newGadgets = parentItem.system.gadgets.map((g) => (g._id === this.id ? { ...g, effects: updated } : g));

      await parentItem.update({ "system.gadgets": newGadgets });
      this._collections = {};
      return this.effects.filter((e) => newEffects.some((n) => n._id === e.id));
   }

   async deleteEmbeddedDocuments(embeddedName, ids, context = {}) {
      if (embeddedName !== "ActiveEffect") throw new Error(`Unsupported embedded type: ${embeddedName}`);
      const parentItem = this.parent;
      if (!parentItem) throw new Error("Cannot delete ActiveEffects — Gadget has no parent");

      const current = this._source.effects ?? [];
      const remaining = current.filter((e) => !ids.includes(e._id));

      const newGadgets = parentItem.system.gadgets.map((g) => (g._id === this.id ? { ...g, effects: remaining } : g));

      await parentItem.update({ "system.gadgets": newGadgets });
      this._collections = {};
      return ids;
   }

   async updateEmbeddedDocuments(embeddedName, updates = [], context = {}) {
      if (embeddedName !== "ActiveEffect") throw new Error(`Unsupported embedded type: ${embeddedName}`);
      const parentItem = this.parent;
      if (!parentItem) throw new Error("Cannot update ActiveEffects — Gadget has no parent");

      const current = this._source.effects ?? [];
      const updated = current.map((e) => {
         const patch = updates.find((u) => u._id === e._id);
         return patch ? foundry.utils.mergeObject(e, patch, { inplace: false }) : e;
      });

      const newGadgets = parentItem.system.gadgets.map((g) => (g._id === this.id ? { ...g, effects: updated } : g));

      await parentItem.update({ "system.gadgets": newGadgets });
      this._collections = {};
      return this.effects.filter((e) => updates.some((u) => u._id === e.id));
   }

   get name() {
      return this._source?.name;
   }

   set name(value) {
      this._source.name = value;
   }

   get type() {
      return this._source?.type;
   }

   set type(value) {
      this._source.type = value;
   }

   get img() {
      return this._source?.img;
   }

   set img(value) {
      this._source.img = value;
   }

   get system() {
      return this._source?.system;
   }

   set system(value) {
      this._source.system = value;
   }

   get flags() {
      return this._source?.flags ?? {};
   }

   set flags(value) {
      this._source.flags = value;
   }

   toJSON() {
      return this.toObject();
   }

   toObject() {
      return {
         _id: this.id,
         name: this.name,
         type: this.type,
         img: this.img,
         system: foundry.utils.deepClone(this.system),
         flags: foundry.utils.deepClone(this.flags),
         effects: Array.from(this.effects.values()).map((e) => e.toObject()),
      };
   }
}
