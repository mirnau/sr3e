import Gadget from "@documents/Gadget.js";
import GadgetSheet from "@sheets/GadgetSheet.js";

export default class SR3EItem extends Item {
   static get metadata() {
      const base = super.metadata;
      return {
         ...base,
         embedded: {
            ...base.embedded,
            Gadget: "gadgets", // ✅ store directly on root, not system.gadgets
         },
      };
   }

   static Register() {
      CONFIG.Item.documentClass = SR3EItem;
      CONFIG.Item.embeddedDocumentClasses ??= {};
      CONFIG.Item.embeddedDocumentClasses.Gadget = Gadget;

      // Optional: helpful for introspection
      CONFIG.Item.embedded ??= {};
      CONFIG.Item.embedded.Gadget = Gadget;
   }

   static defineSchema() {
      const schema = super.defineSchema();
      schema.gadgets = new foundry.data.fields.EmbeddedCollectionField(Gadget, {
         initial: [],
      });
      return schema;
   }

   get gadgets() {
      return this.getEmbeddedCollection("Gadget");
   }

   prepareDerivedData() {
      super.prepareDerivedData();

      for (const gadget of this.gadgets) {
         for (const effect of gadget.effects.values()) {
            if (effect.transfer && (!gadget.system?.transferTo || gadget.system.transferTo === "item")) {
               effect.parent = this;
               this.effects.set(effect.id, effect);
            }
         }
      }
   }

   async addGadget(gadgetItem) {
      const gadgetId = foundry.utils.randomID();

      const clonedEffects = gadgetItem.effects.contents.map((effect) => {
         const data = effect.toObject();
         data._id = foundry.utils.randomID();
         data.origin = `Item.${this.id}.gadgets.${gadgetId}`;
         return data;
      });

      const typeKey = gadgetItem.system.gadget?.target?.split(".").pop() ?? "generic";

      const gadgetData = {
         _id: gadgetId,
         name: gadgetItem.name,
         type: typeKey,
         img: gadgetItem.img,
         system: foundry.utils.deepClone(gadgetItem.system),
         effects: clonedEffects,
         flags: {
            sr3e: {
               embeddedFrom: gadgetItem.uuid,
            },
         },
      };

      return this.createEmbeddedDocuments("Gadget", [gadgetData]);
   }

   async removeGadget(gadgetId) {
      return this.deleteEmbeddedDocuments("Gadget", [gadgetId]);
   }

   async openGadgetEditor(gadgetId) {
      const gadget = this.gadgets.get(gadgetId);
      if (!gadget) {
         throw new Error(`No gadget with ID "${gadgetId}" found on item "${this.name}".`);
      }

      return gadget.sheet.render(true);
   }
}
