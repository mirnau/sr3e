// module/models/TechnicalInterfaceModel.js
import CommodityModel from "@models/item/components/Commodity.js";
import PortabilityModel from "@models/item/components/Portability.js";

export default class TechnicalInterfaceModel extends foundry.abstract.DataModel {
   static defineSchema() {
      const { fields } = foundry.data;

      return {
         subtype: new fields.StringField({
            required: true,
            initial: "cyberdeck",
            choices: ["cyberdeck", "rcdeck", "cyberterminal"],
         }),

         // Make/Model removed; flavor is captured in the item name

         matrix: new fields.SchemaField({
            mpcp: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
            bod: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
            evasion: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
            masking: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
            sensor: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
            hardening: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
            activeMp: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
            storageMp: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
            ioMpPerCT: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
            responseIncrease: new fields.NumberField({ integer: true, min: 0, max: 3, initial: 0 }),
         }),

         rigger: new fields.SchemaField({
            rating: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
            fluxRating: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
            subscribers: new fields.ArrayField(new fields.StringField({ nullable: false }), { initial: [] }),
         }),

         loaded: new fields.SchemaField({
            programs: new fields.ArrayField(
               new fields.SchemaField({
                  uuid: new fields.StringField({ required: true }),
                  kind: new fields.StringField({ initial: "operational" }), // operational | special | offensive | defensive
                  tag: new fields.StringField({ initial: "" }), // e.g., sleaze, analyze, attack
                  rating: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
                  active: new fields.BooleanField({ initial: true }),
               }),
               { initial: [] }
            ),
            riggerModes: new fields.ArrayField(
               new fields.StringField(),
               { initial: [] } // e.g., "captains-chair", "primary", "secondary"
            ),
         }),

         // Standard commodity/portability profiles
         portability: new foundry.data.fields.SchemaField(PortabilityModel.defineSchema()),
         commodity: new foundry.data.fields.SchemaField(CommodityModel.defineSchema()),
      };
   }
}