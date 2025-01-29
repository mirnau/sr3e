
export default class SkillSpecializationModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            name: new foundry.data.fields.StringField({
                required: true,
                initial: ""
            }),
            value: new foundry.data.fields.NumberField({
                required: true,
                integer: true,
                initial: 0,
            }),
        };
    }
}
