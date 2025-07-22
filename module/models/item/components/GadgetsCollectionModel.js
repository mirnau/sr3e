import CommodityModel from "@models/item/components/Commodity.js";
import PortabilityModel from "@models/item/components/Portability.js";

export default class GadgetModel extends foundry.abstract.TypeDataModel {
   static defineSchema() {
      return {
         collection: new foundry.data.fields.ArrayField(
            new foundry.data.fields.SchemaField({
               id: new foundry.data.fields.StringField({ required: true }),
               value: new foundry.data.fields.StringField({ required: true }),
            }),
            { required: true, initial: [] }
         ),
      };
   }

   add(gadget) {
      //Demount it from the data base, to be its own instance
      gadget._id = gadget.id = foundry.utils.randomID();
      const obj = JSON.stringify(gadget);
      const collection = [...this.collection, { id: gadget.id, obj }];
   }

   open(id) {

   }

   remove(item, gadgetId) {
      // get gadget
      // remove ae from item
      // destroy gadget
   }
}
