export default class SpellModel extends foundry.abstract.TypeDataModel {
   static defineSchema() {
      return {
         type: new foundry.data.fields.StringField({
            required: true,
            initial: "", // physical or mana
         }),
         category: new foundry.data.fields.StringField({
            required: true,
            initial: "",
         }),
         duration: new foundry.data.fields.SchemaField({
            type: new foundry.data.fields.StringField({
               required: true,
               initial: "",
            }),
            rounds: new foundry.data.fields.NumberField({
               required: true,
               initial: 0,
               integer: true,
            }),
         }),
         learnedForce: new foundry.data.fields.NumberField({
            required: true,
            initial: 0,
            integer: true,
         }),
         targeting: new foundry.data.fields.SchemaField({
            opponentsAttribute: new foundry.data.fields.StringField({
               required: true,
               initial: "",
            }),
            staticTargetNumber: new foundry.data.fields.NumberField({
               required: true,
               initial: 0,
               integer: true,
            }),
         }),
         drain: new foundry.data.fields.NumberField({
            required: true,
            initial: 0,
         }),
      };
   }
}