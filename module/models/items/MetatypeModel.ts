type RangeSchema = {
  min: NumberField;
  average: NumberField;
  max: NumberField;
};

type AttributeLimitsSchema = {
  strength: NumberField;
  quickness: NumberField;
  body: NumberField;
  charisma: NumberField;
  intelligence: NumberField;
  willpower: NumberField;
};

type MetatypeSchema = {
  agerange: SchemaField<RangeSchema>;
  physical: SchemaField<{
    height: SchemaField<RangeSchema>;
    weight: SchemaField<RangeSchema>;
  }>;
  attributeLimits: SchemaField<AttributeLimitsSchema>;
  karma: SchemaField<{ factor: NumberField }>;
  movement: SchemaField<{ factor: NumberField }>;
  priority: StringField;
  journalId: StringField;
};

export default class MetatypeModel extends TypeDataModel<
  MetatypeSchema,
  BaseItem
> {
  static defineSchema(): MetatypeSchema {
    const range = () =>
      new SchemaField({
        min: new NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
        average: new NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
        max: new NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
      });

    return {
      agerange: range(),
      physical: new SchemaField({
        height: range(),
        weight: range(),
      }),
      attributeLimits: new SchemaField({
        strength: new NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
        quickness: new NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
        body: new NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
        charisma: new NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
        intelligence: new NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
        willpower: new NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
      }),
      karma: new SchemaField({
        factor: new NumberField({
          required: true,
          initial: 0,
        }),
      }),
      movement: new SchemaField({
        factor: new NumberField({
          required: true,
          initial: 0,
        }),
      }),
      priority: new StringField({
        required: true,
        initial: "",
      }),
      journalId: new StringField({
        required: true,
        initial: "",
      }),
    };
  }
}
