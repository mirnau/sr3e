export default class SR3EItem extends Item {
   static Register() {
      CONFIG.Item.documentClass = SR3EItem;

      const meta = this.metadata;
      meta.embedded ??= {};
      meta.embedded.Item = "gadgets";
      foundry.documents.BaseItem.metadata = meta;

      this.embeddedClasses = {
         ActiveEffect: CONFIG.ActiveEffect.documentClass,
         Item: CONFIG.Item.documentClass,
      };

      // Monkeypatch getEmbeddedCollection to support Item as embedded
      const originalGetEmbeddedCollection = this.prototype.getEmbeddedCollection;
      this.prototype.getEmbeddedCollection = function (embeddedName) {
         if (embeddedName === "Item") {
            if (!this._embedded) this._embedded = {};
            if (!this._embedded.collections) this._embedded.collections = {};

            if (!this._embedded.collections.gadgets) {
               const cls = CONFIG.Item.documentClass;
               const rawData = this._source?.gadgets ?? [];
               const collection = new Collection();

               for (let datum of rawData) {
                  const doc = new cls(datum, { parent: this });
                  collection.set(doc.id, doc);
               }

               this._embedded.collections.gadgets = collection;
            }

            return this._embedded.collections.gadgets;
         }

         return originalGetEmbeddedCollection.call(this, embeddedName);
      };
   }

   static get metadata() {
      return foundry.utils.mergeObject(super.metadata, {
         embedded: {
            ActiveEffect: "effects",
            Item: "gadgets",
         },
      });
   }

   prepareBaseData() {
      super.prepareBaseData();
      this.effects?.prepareData?.();
      for (const gadget of this.gadgets?.contents ?? []) {
         gadget.prepareData?.();
         gadget.effects?.prepareData?.();
         gadget.applyActiveEffects?.();
      }
   }

   get gadgets() {
      return this.getEmbeddedCollection("Item");
   }

   async addGadget(gadgetItem) {
      const gadgetId = foundry.utils.randomID();

      const gadgetData = {
         _id: gadgetId,
         name: gadgetItem.name,
         type: gadgetItem.type,
         img: gadgetItem.img,
         system: foundry.utils.deepClone(gadgetItem.system),
         effects: gadgetItem.effects.contents.map((effect) => {
            const data = effect.toObject();
            data._id = foundry.utils.randomID();
            data.origin = `Item.${this.id}.gadgets.${gadgetId}`;
            return data;
         }),
         flags: {
            sr3e: {
               embeddedFrom: gadgetItem.uuid,
            },
         },
      };

      await this.createEmbeddedDocuments("Item", [gadgetData]);
      await this.createEmbeddedDocuments("ActiveEffect", gadgetData.effects);
   }

   async removeGadget(gadgetId) {
      const origin = `Item.${this.id}.gadgets.${gadgetId}`;
      const effectIds = this.effects.contents.filter((e) => e.origin === origin).map((e) => e.id);
      if (effectIds.length > 0) await this.deleteEmbeddedDocuments("ActiveEffect", effectIds);
      await this.deleteEmbeddedDocuments("Item", [gadgetId]);
   }

   async openGadgetEditor(gadgetId) {
      const gadget = this.gadgets.get(gadgetId);
      if (!gadget) return;
      gadget.sheet.render(true);
   }
}
