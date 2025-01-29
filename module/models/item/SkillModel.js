import SkillSpecializationModel from './components/SkillSpecialization.js';

export default class SkillModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const createSpecializationSchema = () => {
            return new foundry.data.fields.ArrayField(
                new foundry.data.fields.SchemaField(SkillSpecializationModel.defineSchema())
            );
        };

        return {
            skillType: new foundry.data.fields.StringField({
                required: true,
                default: "activeSkill"
            }),

            activeSkill: new foundry.data.fields.SchemaField({
                value: new foundry.data.fields.NumberField({
                    required: true,
                    default: 0,
                    integer: true
                }),
                linkedAttribute: new foundry.data.fields.StringField({
                    required: true,
                    default: ""
                }),
                specializations:
                    createSpecializationSchema({ initial: [] })

            }),

            knowledgeSkill: new foundry.data.fields.SchemaField({
                value: new foundry.data.fields.NumberField({
                    required: true,
                    default: 0,
                    integer: true
                }),
                linkedAttribute: new foundry.data.fields.StringField({
                    required: true,
                    default: "intelligence"
                }),
                specializations:
                    createSpecializationSchema({ initial: [] })

            }),

            languageSkill: new foundry.data.fields.SchemaField({
                speak: new foundry.data.fields.SchemaField({
                    value: new foundry.data.fields.NumberField({
                        required: true,
                        default: 0,
                        integer: true
                    }),
                    specializations:
                        createSpecializationSchema({ initial: [] })

                }),
                read: new foundry.data.fields.SchemaField({
                    value: new foundry.data.fields.NumberField({
                        required: true,
                        default: 0,
                        integer: true
                    }),
                    specializations:
                        createSpecializationSchema({ initial: [] })

                }),
                write: new foundry.data.fields.SchemaField({
                    value: new foundry.data.fields.NumberField({
                        required: true,
                        default: 0,
                        integer: true
                    }),
                    specializations:
                        createSpecializationSchema({ initial: [] })

                })
            }),

            description: new foundry.data.fields.StringField({
                required: false,
                default: ""
            })
        };
    }
}
