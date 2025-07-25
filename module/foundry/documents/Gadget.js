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
         collection: "gadgets",
         label: "Gadget",
         labelPlural: "Gadgets",
         isPrimary: true,
         embedded: {},
         permissions: { create: "ITEM_CREATE" },
         hasSystemData: true,
         indexed: true,
         types: ["weaponmod"],
      };
   }

   static Register() {
      CONFIG.Gadget = foundry.utils.mergeObject(
         CONFIG.Gadget ?? {},
         {
            documentClass: Gadget,
            dataModels: {
               weaponmod: GadgetModel,
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

   get effects() {
      if (!this._effects) {
         const raw = this._source?.effects ?? [];
         const col = new foundry.utils.Collection();
         for (const effectData of raw) {
            const effect = new CONFIG.ActiveEffect.documentClass(effectData, { parent: this });
            col.set(effect.id, effect);
         }
         this._effects = col;
      }
      return this._effects;
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
