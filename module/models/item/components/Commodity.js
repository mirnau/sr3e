export default class CommodityModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
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
                restrictionLevel: new foundry.data.fields.NumberField({
                    required: true,
                    initial: 0,
                }),
                type: new foundry.data.fields.StringField({ required: false, initial: "" }),
                category: new foundry.data.fields.StringField({ required: false, initial: "" }),
            }),
            isBroken: new foundry.data.fields.BooleanField({ initial: false }),
            description: new foundry.data.fields.StringField({
                required: false,
                initial: "Enter your description",
            }),
        };
    }
}
