import SimpleStat from "./SimpleStat";

export default class AttributesModel extends foundry.abstract.TypeDataModel {
   static defineSchema() {
      return {
         // Attributes using ComplexStat (with meta)
         body: new foundry.data.fields.SchemaField(SimpleStat.defineSchema()),
         quickness: new foundry.data.fields.SchemaField(SimpleStat.defineSchema()),
         strength: new foundry.data.fields.SchemaField(SimpleStat.defineSchema()),
         charisma: new foundry.data.fields.SchemaField(SimpleStat.defineSchema()),
         intelligence: new foundry.data.fields.SchemaField(SimpleStat.defineSchema()),
         willpower: new foundry.data.fields.SchemaField(SimpleStat.defineSchema()),

         // NOTE: Active Effect driven attributes
         reaction: new foundry.data.fields.SchemaField(SimpleStat.defineSchema()),
         magic: new foundry.data.fields.SchemaField(SimpleStat.defineSchema()),
         essence: new foundry.data.fields.SchemaField(SimpleStat.defineSchema()),
         initiative: new foundry.data.fields.SchemaField(SimpleStat.defineSchema()),

         isBurnedOut: new foundry.data.fields.BooleanField({
            initial: false,
         }),
      };
   }
}
