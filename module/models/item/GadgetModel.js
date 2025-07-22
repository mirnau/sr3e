import CommodityModel from "@models/item/components/Commodity.js";
import PortabilityModel from "@models/item/components/Portability.js";

export default class GadgetModel extends foundry.abstract.TypeDataModel {
   static defineSchema() {
      return {
         isOn: new foundry.data.fields.BooleanField({
            required: true,
            initial: false,
         }),

         portability: new foundry.data.fields.SchemaField(PortabilityModel.defineSchema()),
         commodity: new foundry.data.fields.SchemaField(CommodityModel.defineSchema()),
      };
   }
}
