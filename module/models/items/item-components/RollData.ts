export default class RollDataModel extends TypeDataModel<RollDataSchema, BaseItem> {
  static defineSchema(): RollDataSchema {
    return {
      targetNumber: new SchemaField({
        value: new NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
        mod: new NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
      }),
    };
  }
}

type RollDataSchema = {
  targetNumber: SchemaField<{
    value: NumberField;
    mod: NumberField;
  }>;
};