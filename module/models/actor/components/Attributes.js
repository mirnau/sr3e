import SimpleStat from "./SimpleStat";

export default class AttributesModel extends foundry.abstract.TypeDataModel {
   static defineSchema() {
      return {
         // Attributes using ComplexStat (with meta)
         body: new foundry.data.fields.NumberField({
            initial: 0,
            required: true,
         }),
         quickness: new foundry.data.fields.NumberField({
            initial: 0,
            required: true,
         }),
         strength: new foundry.data.fields.NumberField({
            initial: 0,
            required: true,
         }),
         charisma: new foundry.data.fields.NumberField({
            initial: 0,
            required: true,
         }),
         intelligence: new foundry.data.fields.NumberField({
            initial: 0,
            required: true,
         }),
         willpower: new foundry.data.fields.NumberField({
            initial: 0,
            required: true,
         }),

         // NOTE: Active Effect driven attributes
         reaction: new foundry.data.fields.NumberField({
            initial: 0,
            required: true,
         }),
         magic: new foundry.data.fields.NumberField({
            initial: 0,
            required: true,
         }),
         essence: new foundry.data.fields.NumberField({
            initial: 0,
            required: true,
         }),
         initiative: new foundry.data.fields.NumberField({
            initial: 0,
            required: true,
         }),

         isBurnedOut: new foundry.data.fields.BooleanField({
            initial: false,
            required: true,
         }),
      };
   }
}
