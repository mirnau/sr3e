import CommodityModel from "@models/item/components/Commodity.js";
import PortabilityModel from "@models/item/components/Portability.js";
import RollDataModel from "@models/item/components/RollData.js";
import RangeBandModel from "@models/item/components/RangeBand.js";

export default class WeaponModel extends foundry.abstract.TypeDataModel {
   static defineSchema() {
      return {
         mode: new foundry.data.fields.StringField({
            required: true,
            initial: "",
         }),
         ammunitionClass: new foundry.data.fields.StringField({
            required: true,
            initial: "",
         }),
         damage: new foundry.data.fields.NumberField({
            required: true,
            initial: 0,
         }),
         damageType: new foundry.data.fields.StringField({
            required: true,
            initial: "",
         }),
         shotsPerRound: new foundry.data.fields.NumberField({
            required: true,
            initial: 1,
         }),
         reach: new foundry.data.fields.NumberField({
            required: true,
            initial: 0,
            min: 0,
         }),
         range: new foundry.data.fields.NumberField({
            required: true,
            initial: 0,
            integer: true,
         }),
         recoilComp: new foundry.data.fields.NumberField({
            required: true,
            initial: 0.0,
         }),
         reloadMechanism: new foundry.data.fields.StringField({
            required: true,
            initial: "",
         }),
         linkedSkillId: new foundry.data.fields.StringField({
            required: true,
            initial: "",
         }),
         ammoId: new foundry.data.fields.StringField({
            required: true,
            initial: "",
         }),
         isDefaulting: new foundry.data.fields.BooleanField({
            required: true,
            initial: false,
         }),

         rangeBand: new foundry.data.fields.SchemaField(RangeBandModel.defineSchema()),
         roll: new foundry.data.fields.SchemaField(RollDataModel.defineSchema()),
         portability: new foundry.data.fields.SchemaField(PortabilityModel.defineSchema()),
         commodity: new foundry.data.fields.SchemaField(CommodityModel.defineSchema()),
      };
   }
}
