import SkillSpecialization from './components/SkillSpecialization.js';

export default class SkillModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {

            skillType: new foundry.data.fields.StringField({
                required: true,
                initial: "active"
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
                specializations: new foundry.data.fields.ArrayField(
                    new foundry.data.fields.SchemaField({
                        ...SkillSpecialization.defineSchema()
                    }),
                    {
                        initial: []
                    }
                )
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

                specializations: new foundry.data.fields.ArrayField(
                    new foundry.data.fields.SchemaField({
                        ...SkillSpecialization.defineSchema()
                    }),
                    {
                        initial: []
                    }
                )

            }),

            languageSkill: new foundry.data.fields.SchemaField({
                speak: new foundry.data.fields.SchemaField({
                    value: new foundry.data.fields.NumberField({
                        required: true,
                        initial: 0,
                        integer: true
                    }),
                    linkedAttribute: new foundry.data.fields.StringField({
                        required: true,
                        initial: "intelligence"
                    }),

                    specializations: new foundry.data.fields.ArrayField(
                        new foundry.data.fields.SchemaField({
                            ...SkillSpecialization.defineSchema()
                        }),
                        {
                            initial: []
                        }
                    )
                }),
                read: new foundry.data.fields.SchemaField({
                    value: new foundry.data.fields.NumberField({
                        required: true,
                        initial: 0,
                        integer: true
                    }),

                    specializations: new foundry.data.fields.ArrayField(
                        new foundry.data.fields.SchemaField({
                            ...SkillSpecialization.defineSchema()
                        }),
                        {
                            initial: []
                        }
                    )
                }),
                write: new foundry.data.fields.SchemaField({
                    value: new foundry.data.fields.NumberField({
                        required: true,
                        initial: 0,
                        integer: true
                    }),

                    specializations: new foundry.data.fields.ArrayField(
                        new foundry.data.fields.SchemaField({
                            ...SkillSpecialization.defineSchema()
                        }),
                        {
                            initial: []
                        }
                    )
                })
            }),

            journalId: new foundry.data.fields.StringField({
                required: true,
                initial: ""
            })
        };
    }
}