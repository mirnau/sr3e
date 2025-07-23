import CommodityModel from "@models/item/components/Commodity.js";
import PortabilityModel from "@models/item/components/Portability.js";

export default class GadgetCreatorModel extends foundry.abstract.TypeDataModel {
   static defineSchema() {
      return {
         gadget: new foundry.data.fields.SchemaField({
            isOn: new foundry.data.fields.BooleanField({
               required: true,
               initial: false,
            }),
            target: new foundry.data.fields.StringField({
               required: true,
               initial: "weaponmod"
            })
         }),

         portability: new foundry.data.fields.SchemaField(
            PortabilityModel.defineSchema()
         ),

         commodity: new foundry.data.fields.SchemaField(
            CommodityModel.defineSchema()
         ),
      };
   }
}
