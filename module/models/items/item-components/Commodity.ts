type CommoditySchema = {
  days: NumberField;
  cost: NumberField;
  streetIndex: NumberField;
  legality: SchemaField<{
    status: StringField;
    permit: StringField;
    priority: StringField;
  }>;
  isBroken: BooleanField;
};

export default class CommodityModel extends TypeDataModel<CommoditySchema, BaseItem> {
  static defineSchema(): CommoditySchema {
    return {
      days: new NumberField({
        required: true,
        initial: 0,
      }),
      cost: new NumberField({
        required: true,
        initial: 0,
      }),
      streetIndex: new NumberField({
        required: true,
        initial: 1.0,
      }),
      legality: new SchemaField({
        status: new StringField({
          required: true,
          initial: "0",
        }),
        permit: new StringField({
          required: true,
          initial: "",
        }),
        priority: new StringField({
          required: true,
          initial: "",
        }),
      }),
      isBroken: new BooleanField({
        required: true,
        initial: false,
      }),
    };
  }
}