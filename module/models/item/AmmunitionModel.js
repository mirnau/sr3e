import CommodityModel from "@models/item/components/Commodity.js";
import PortabilityModel from "@models/item/components/Portability.js";

export default class AmmunitionModel extends foundry.abstract.TypeDataModel {
   static defineSchema() {
      return {
         class: new foundry.data.fields.StringField({
            required: true,
            initial: "regular",
         }),
         type: new foundry.data.fields.StringField({
            required: true,
            initial: "lightPistol",
         }),
         reloadMechanism: new foundry.data.fields.StringField({
            required: true,
            initial: "",
         }),
         rounds: new foundry.data.fields.NumberField({
            required: true,
            initial: 10,
            integer: true,
         }),
         

         portability: new foundry.data.fields.SchemaField(PortabilityModel.defineSchema()),
         commodity: new foundry.data.fields.SchemaField(CommodityModel.defineSchema()),
      };
   }
}
