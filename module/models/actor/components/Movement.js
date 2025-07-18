import SimpleStat from "./SimpleStat.js";

export default class AttributesModel extends foundry.abstract.TypeDataModel {
   static defineSchema() {
      return {
         walking: new foundry.data.fields.NumberField({
            initial: 0,
            required: true,
         }),
         running: new foundry.data.fields.NumberField({
            initial: 0,
            required: true,
         }),
      };
   }
}
