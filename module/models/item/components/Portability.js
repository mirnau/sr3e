export default class PortabilityModel extends foundry.abstract.TypeDataModel {
   static defineSchema() {
      return {
         conceal: new foundry.data.fields.NumberField({
            required: true,
            initial: 0,
         }),
         weight: new foundry.data.fields.NumberField({
            required: true,
            initial: 0.0,
         }),
      };
   }
}