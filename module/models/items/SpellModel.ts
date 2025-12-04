export default class SpellModel extends foundry.abstract.TypeDataModel<SpellSchema, BaseItem> {
  static defineSchema(): SpellSchema {
    return {
      type: new StringField({
        required: true,
        initial: "",
      }),
      category: new StringField({
        required: true,
        initial: "",
      }),
      duration: new SchemaField({
        type: new StringField({
          required: true,
          initial: "",
        }),
        rounds: new NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
      }),
      learnedForce: new NumberField({
        required: true,
        initial: 0,
        integer: true,
      }),
      targeting: new SchemaField({
        opponentsAttribute: new StringField({
          required: true,
          initial: "",
        }),
        staticTargetNumber: new NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
      }),
      drain: new NumberField({
        required: true,
        initial: 0,
      }),
    };
  }
}

type SpellSchema = {
  type: StringField;
  category: StringField;
  duration: SchemaField<{
    type: StringField;
    rounds: NumberField;
  }>;
  learnedForce: NumberField;
  targeting: SchemaField<{
    opponentsAttribute: StringField;
    staticTargetNumber: NumberField;
  }>;
  drain: NumberField;
};