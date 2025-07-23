import SR3EGadget from "@documents/SR3EGadget.js";

export default class SR3EItem extends Item {
   static Register() {
      CONFIG.Item.documentClass = SR3EItem;
   }

   prepareBaseData() {
      super.prepareBaseData();
      this.effects?.prepareData?.();

      for (const gadget of this.gadgets) {
         gadget.hydrateEffects?.();
         gadget.prepareData?.();
         gadget.effects?.prepareData?.();
         gadget.applyActiveEffects?.();
         gadget.autoApply?.(this); // optional, if not applied yet
      }
   }

   get gadgets() {
      return (this.system.gadgets ?? []).map(data =>
         new SR3EGadget(data, { parent: this })
      );
   }

   async addGadget(gadgetItem) {
      const gadgetId = foundry.utils.randomID();

      const clonedEffects = gadgetItem.effects.contents.map((effect) => {
         const data = effect.toObject();
         data._id = foundry.utils.randomID();
         data.origin = `Item.${this.id}.gadgets.${gadgetId}`;
         return data;
      });

      const gadgetData = {
         _id: gadgetId,
         name: gadgetItem.name,
         type: gadgetItem.system.gadget.target,
         img: gadgetItem.img,
         system: foundry.utils.deepClone(gadgetItem.system),
         effects: clonedEffects,
         flags: {
            sr3e: {
               embeddedFrom: gadgetItem.uuid,
            },
         },
      };

      const updated = [...(this.system.gadgets ?? []), gadgetData];
      await this.update({ "system.gadgets": updated });

      const hydrated = new SR3EGadget(gadgetData, { parent: this });
      hydrated.hydrateEffects();
      await hydrated.autoApply(this);
   }

   async removeGadget(gadgetId) {
      const gadgets = this.system.gadgets ?? [];
      const removed = gadgets.find((g) => g._id === gadgetId);
      if (!removed) return;

      const gadget = new SR3EGadget(removed, { parent: this });
      gadget.hydrateEffects();
      await gadget.autoRemove(this);

      const filtered = gadgets.filter((g) => g._id !== gadgetId);
      await this.update({ "system.gadgets": filtered });
   }

   async openGadgetEditor(gadgetId) {
      const gadget = this.gadgets.find((g) => g.id === gadgetId || g._id === gadgetId);
      if (!gadget?.sheet) return;
      gadget.sheet.render(true);
   }
}
