import SkillSpecialization from './components/SkillSpecialization.js';

export default class SkillModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {

            skillType: new foundry.data.fields.StringField({
                required: true,
                initial: ""
            }),

            activeSkill: new foundry.data.fields.SchemaField({
                value: new foundry.data.fields.NumberField({
                    required: true,
                    initial: 0,
                    integer: true
                }),
                linkedAttribute: new foundry.data.fields.StringField({
                    required: true,
                    initial: ""
                }),

                ...SkillSpecialization.defineSchema()
            }),

            knowledgeSkill: new foundry.data.fields.SchemaField({
                value: new foundry.data.fields.NumberField({
                    required: true,
                    initial: 0,
                    integer: true
                }),
                linkedAttribute: new foundry.data.fields.StringField({
                    required: true,
                    initial: "intelligence"
                }),

                ...SkillSpecialization.defineSchema()

            }),

            languageSkill: new foundry.data.fields.SchemaField({
                speak: new foundry.data.fields.SchemaField({
                    value: new foundry.data.fields.NumberField({
                        required: true,
                        initial: 0,
                        integer: true
                    }),

                    ...SkillSpecialization.defineSchema()
                }),
                read: new foundry.data.fields.SchemaField({
                    value: new foundry.data.fields.NumberField({
                        required: true,
                        initial: 0,
                        integer: true
                    }),

                    ...SkillSpecialization.defineSchema()
                }),
                write: new foundry.data.fields.SchemaField({
                    value: new foundry.data.fields.NumberField({
                        required: true,
                        initial: 0,
                        integer: true
                    }),

                    ...SkillSpecialization.defineSchema()
                })
            }),
        };
    }
}