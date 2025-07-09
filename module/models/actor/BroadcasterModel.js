export default class BroadcasterModel extends foundry.abstract.TypeDataModel {
   static defineSchema() {
      return {
         preparedNews: new foundry.data.fields.ArrayField(new foundry.data.fields.StringField(), {
            initial: [],
            required: true,
         }),
         rollingNews: new foundry.data.fields.ArrayField(new foundry.data.fields.StringField(), {
            initial: [],
            required: true,
         }),
         isBroadcasting: new foundry.data.fields.BooleanField({
            required: true,
            initial: false,
         }),
         journalId: new foundry.data.fields.StringField({
            required: true,
            initial: "",
         }),
      };
   }
}
