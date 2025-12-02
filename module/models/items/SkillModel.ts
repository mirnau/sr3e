import SkillSpecializationModel from "./item-components/SkillSpecialization";

export default class SkillModel extends TypeDataModel<SkillSchema, BaseItem> {
  static defineSchema(): SkillSchema {
    const specializations = () =>
      new ArrayField(new EmbeddedDataField(SkillSpecializationModel), {
        initial: [],
      });

    return {
      skillType: new StringField({
        required: true,
        initial: "active",
      }),
      activeSkill: new SchemaField({
        value: new NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
        linkedAttribute: new StringField({
          required: true,
          initial: "",
        }),
        associatedDicePool: new StringField({
          required: true,
          initial: "",
        }),
        specializations: specializations(),
      }),
      knowledgeSkill: new SchemaField({
        value: new NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
        linkedAttribute: new StringField({
          required: true,
          initial: "intelligence",
        }),
        specializations: specializations(),
      }),
      languageSkill: new SchemaField({
        value: new NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
        linkedAttribute: new StringField({
          required: true,
          initial: "intelligence",
        }),
        specializations: specializations(),
        readwrite: new SchemaField({
          value: new NumberField({
            required: true,
            initial: 0,
            integer: true,
          }),
        }),
        journalId: new StringField({
          required: true,
          initial: "",
        }),
      }),
    };
  }
}

type SkillSpecializationsField = ArrayField<EmbeddedDataField<typeof SkillSpecializationModel>>;

type ActiveSkillSchema = {
  value: NumberField;
  linkedAttribute: StringField;
  associatedDicePool: StringField;
  specializations: SkillSpecializationsField;
};

type KnowledgeSkillSchema = {
  value: NumberField;
  linkedAttribute: StringField;
  specializations: SkillSpecializationsField;
};

type LanguageSkillSchema = {
  value: NumberField;
  linkedAttribute: StringField;
  specializations: SkillSpecializationsField;
  readwrite: SchemaField<{
    value: NumberField;
  }>;
  journalId: StringField;
};

type SkillSchema = {
  skillType: StringField;
  activeSkill: SchemaField<ActiveSkillSchema>;
  knowledgeSkill: SchemaField<KnowledgeSkillSchema>;
  languageSkill: SchemaField<LanguageSkillSchema>;
};
