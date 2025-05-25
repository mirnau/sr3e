export default class SR3EComponentModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            components: new foundry.data.fields.ArrayField(
                new foundry.data.fields.SchemaField({
                    id: new foundry.data.fields.StringField({ required: true }),
                    name: new foundry.data.fields.StringField({ initial: "Untitled Component" }),
                    type: new foundry.data.fields.StringField({ initial: "custom" }),
                    collapsed: new foundry.data.fields.BooleanField({ initial: false }),
                    statCards: new foundry.data.fields.ArrayField(
                        new foundry.data.fields.SchemaField({
                            id: new foundry.data.fields.StringField({ required: true }),
                            name: new foundry.data.fields.StringField({ initial: "Untitled Stat" }),
                            type: new foundry.data.fields.StringField({
                                choices: ["text", "number", "boolean", "select", "textarea"],
                                initial: "text"
                            }),
                            value: new foundry.data.fields.JSONField({ initial: "" }),
                            options: new foundry.data.fields.ArrayField(
                                new foundry.data.fields.StringField(),
                                { initial: [] }
                            ),
                            description: new foundry.data.fields.StringField({ initial: "" }),
                            required: new foundry.data.fields.BooleanField({ initial: false })
                        })
                    ),
                    position: new foundry.data.fields.SchemaField({
                        x: new foundry.data.fields.NumberField({ initial: 0 }),
                        y: new foundry.data.fields.NumberField({ initial: 0 })
                    })
                })
            )
        };
    }
}
