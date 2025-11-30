export default class RangeBandModel extends foundry.abstract.TypeDataModel {
   static defineSchema() {
      return {
         short: new foundry.data.fields.NumberField({
            required: true,
            initial: 5,
            integer: true,
            min: 0,
         }),
         medium: new foundry.data.fields.NumberField({
            required: true,
            initial: 20,
            integer: true,
            min: 0,
         }),
         long: new foundry.data.fields.NumberField({
            required: true,
            initial: 40,
            integer: true,
            min: 0,
         }),
         extreme: new foundry.data.fields.NumberField({
            required: true,
            initial: 60,
            integer: true,
            min: 0,
         }),
      };
   }
}
