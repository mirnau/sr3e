export default class RollDataModel extends foundry.abstract.TypeDataModel {
   static defineSchema() {
      return {
         targetNumber: new foundry.data.fields.SchemaField({
            value: new foundry.data.fields.NumberField({
               required: true,
               initial: 0,
               integer: true,
            }),
            mod: new foundry.data.fields.NumberField({
               required: true,
               initial: 0,
               integer: true,
            }),
         }),
      };
   }
}
