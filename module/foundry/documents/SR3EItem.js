import Gadget from "@documents/Gadget.js";
import GadgetSheet from "@sheets/GadgetSheet.js";

export default class SR3EItem extends Item {
   static get metadata() {
      const base = super.metadata;
      return {
         ...base,
         embedded: {
            ...base.embedded,
            Gadget: "system.gadgets",
         },
      };
   }
   static Register() {
      CONFIG.Item ??= {};
      CONFIG.Item.embedded ??= {};
      CONFIG.Item.embedded.Gadget = Gadget;
      CONFIG.Item.documentClass = SR3EItem;
   }

   get gadgets() {
      const gadgetData = this.system?.gadgets ?? [];
      return new foundry.utils.Collection(
         gadgetData.map((g) => [g._id, new CONFIG.Gadget.documentClass(g, { parent: this })])
      );
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

      await this.createEmbeddedDocuments("Gadget", [gadgetData]);
   }

   async removeGadget(gadgetId) {
      await this.deleteEmbeddedDocuments("Gadget", [gadgetId]);
   }

   async openGadgetEditor(gadgetId) {
      const gadget = this.gadgets.get(gadgetId);
      if (!gadget) {
         throw new Error(`No gadget with ID "${gadgetId}" found on item "${this.name}".`);
      }

      return gadget.sheet.render(true);
   }
}
