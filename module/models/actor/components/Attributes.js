import SimpleStat from "./SimpleStat.js";
import ComplexStat from "./ComplexStat.js";

export default class AttributesModel extends foundry.abstract.TypeDataModel {
   static defineSchema() {
      return {
         // Attributes using ComplexStat (with meta)
         body: new foundry.data.fields.SchemaField(ComplexStat.defineSchema()),
         quickness: new foundry.data.fields.SchemaField(ComplexStat.defineSchema()),
         strength: new foundry.data.fields.SchemaField(ComplexStat.defineSchema()),
         charisma: new foundry.data.fields.SchemaField(ComplexStat.defineSchema()),
         intelligence: new foundry.data.fields.SchemaField(ComplexStat.defineSchema()),
         willpower: new foundry.data.fields.SchemaField(ComplexStat.defineSchema()),
         essence: new foundry.data.fields.NumberField({
          required: true,
          initial: 6,
        }),
         magic: new foundry.data.fields.SchemaField({
            ...SimpleStat.defineSchema(),
            isBurnedOut: new foundry.data.fields.BooleanField({
               initial: false,
            }),
         }),
      };
   }
}
