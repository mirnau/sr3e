import Gadget from "@documents/Gadget.js";
import GadgetSheet from "@sheets/GadgetSheet.js";

export default class SR3EItem extends Item {
   static Register() {
      console.log("SR3EItem.Register() is hit");
      CONFIG.Item.documentClass = SR3EItem;
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

   get gadgets() {
      const stored = this.system.gadgets ?? [];
      return stored.map((data) => new Gadget(data, { parent: this }));
   }

   async addGadget(gadgetItem) {
      console.log("addGadget invoked with:", gadgetItem.name);
      const gadgetId = foundry.utils.randomID();

      const clonedEffects = gadgetItem.effects.contents.map((effect) => {
         const data = effect.toObject();
         data._id = foundry.utils.randomID();
         data.origin = `Item.${this.id}.gadgets.${gadgetId}`;
         return data;
      });

      const typeKey = gadgetItem.system.gadget?.target?.split(".").pop() ?? "generic";

      console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
      console.log("Type Key", typeKey);
      console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

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

      const existing = this.system.gadgets ?? [];
      await this.update({ "system.gadgets": [...existing, gadgetData] });
   }

   async removeGadget(gadgetId) {
      const existing = this.system.gadgets ?? [];
      const filtered = existing.filter((g) => g._id !== gadgetId);
      await this.update({ "system.gadgets": filtered });
   }

   async openGadgetEditor(gadgetId) {
      if (!gadgetId || typeof gadgetId !== "string") {
         throw new Error("Gadget ID must be a string.");
      }

      const raw = this.system.gadgets?.find((g) => g._id === gadgetId);
      if (!raw) {
         throw new Error(`No gadget with ID "${gadgetId}" found on item "${this.name}".`);
      }

      // ✅ Pass the parent in the second argument
      const gadget = new Gadget(raw, { parent: this });

      console.log("Opening Gadget editor for:", gadgetId, gadget);

      return gadget.sheet.render(true);
   }
}
