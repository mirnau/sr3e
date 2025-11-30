import CommodityModel from "@models/item/components/Commodity.js";
import PortabilityModel from "@models/item/components/Portability.js";

export default class WearableModel extends foundry.abstract.TypeDataModel {
   static defineSchema() {
      return {
         ballistic: new foundry.data.fields.NumberField({
            required: true,
            initial: 0,
         }),
         impact: new foundry.data.fields.NumberField({
            required: true,
            initial: 0,
         }),
         canLayer: new foundry.data.fields.BooleanField({
            required: true,
            initial: false,
         }),

         portability: new foundry.data.fields.SchemaField(PortabilityModel.defineSchema()),
         commodity: new foundry.data.fields.SchemaField(CommodityModel.defineSchema()),
      };
   }
}
