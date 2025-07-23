import GadgetCreatorModel from "@models/item/GadgetCreatorModel.js";
import GadgetModel from "@models/gadget/GadgetModel.js";

// Gadget.js
export default class SR3EGadget extends foundry.abstract.Document {
   static get metadata() {
      return {
         name: "Gadget",
         collection: "gadgets",
         label: "Gadget",
         labelPlural: "Gadgets",
         isPrimary: false,
         embedded: {},
         permissions: { create: "ITEM_CREATE" },
         hasSystemData: true,
         indexed: false,
         types: ["weaponmod"],
      };
   }

   static defineSchema() {
      return GadgetModel.defineSchema();
   }

   get uuid() {
      return this._uuid ?? (this._uuid = `Gadget.${foundry.utils.randomID()}`);
   }

   // ✅ Use the source-backed data directly
   get effects() {
      return this._source?.effects ?? [];
   }

   set effects(value) {
      if (Array.isArray(value)) this._source.effects = value;
   }

   get hydratedEffects() {
      return this._hydratedEffects ?? [];
   }

   static Register() {
      CONFIG.SR3EGadget = {
         documentClass: SR3EGadget,
         dataModels: {
            weaponmod: GadgetModel,
         },
      };
   }

   hydrateEffects() {
      this._hydratedEffects = this.effects.map((eff) => new ActiveEffect(eff, { parent: this }));
   }

   async applyEffectsTo(target) {
      if (!target?.uuid || !Array.isArray(this._hydratedEffects)) return;

      const newEffects = this._hydratedEffects.map((effect) => {
         const clone = effect.clone({
            origin: this.uuid ?? `Gadget|${foundry.utils.randomID()}`,
            disabled: effect.disabled,
            transfer: false,
         });
         return foundry.utils.duplicate(clone.toObject());
      });

      return target.createEmbeddedDocuments("ActiveEffect", newEffects);
   }

   async removeEffectsFrom(target) {
      if (!target?.effects) return;
      const origin = this.uuid ?? "Gadget";

      const toRemove = target.effects.filter((e) => e.origin?.startsWith(origin)).map((e) => e.id);

      if (toRemove.length > 0) {
         await target.deleteEmbeddedDocuments("ActiveEffect", toRemove);
      }
   }

   async autoApply(item) {
      const actor = item.parent;
      const target = this.system?.transferTo === "actor" && actor ? actor : item;
      await this.applyEffectsTo(target);
   }

   async autoRemove(item) {
      const actor = item.parent;
      const target = this.system?.transferTo === "actor" && actor ? actor : item;
      await this.removeEffectsFrom(target);
   }

   toJSON() {
      return this.toObject();
   }
}
