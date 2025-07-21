export default class CommodityModel extends foundry.abstract.TypeDataModel {
   static defineSchema() {
      return {
         commodity: new foundry.data.fields.SchemaField({
            days: new foundry.data.fields.NumberField({
               required: true,
               initial: 0,
            }),
            cost: new foundry.data.fields.NumberField({
               required: true,
               initial: 0,
            }),
            streetIndex: new foundry.data.fields.NumberField({
               required: true,
               initial: 1.0,
            }),
            legality: new foundry.data.fields.SchemaField({
               status: new foundry.data.fields.StringField({
                  required: true,
                  initial: 0,
               }),
               permit: new foundry.data.fields.StringField({
                  required: true,
                  initial: "",
               }),
               priority: new foundry.data.fields.StringField({
                  required: true,
                  initial: "",
               }),
            }),
            isBroken: new foundry.data.fields.BooleanField({ initial: false }),
         }),
      };
   }
}
