
export default class SkillSpecializationModel extends foundry.abstract.TypeDataModel<SkillSpecializationSchema, BaseItem> {
  static defineSchema(): SkillSpecializationSchema {
    return {
      name: new StringField({
        required: true,
        initial: "",
      }),
      value: new NumberField({
        required: true,
        integer: true,
        initial: 0,
      }),
    };
  }
}

type SkillSpecializationSchema = {
  name: StringField;
  value: NumberField;
};
