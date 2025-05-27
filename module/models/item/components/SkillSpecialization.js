
export default class SkillSpecialization extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            specialziation: new foundry.data.fields.SchemaField({
                name: new foundry.data.fields.StringField({
                    required: true,
                    initial: ""
                }),
                value: new foundry.data.fields.NumberField({
                    required: true,
                    integer: true,
                    initial: 0,
                })
            }),
        };
    }
}