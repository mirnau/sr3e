export default class PortabilityModel extends foundry.abstract.TypeDataModel {
   static defineSchema() {
      return {
         portability: new foundry.data.fields.SchemaField({
            conceal: new foundry.data.fields.NumberField({
               required: true,
               initial: 0,
            }),
            weight: new foundry.data.fields.NumberField({
               required: true,
               initial: 0.0,
            }),
            isCarriedOnPerson: new foundry.data.fields.BooleanField({
               required: true,
               initial: false,
            }),
         }),
      };
   }
}
