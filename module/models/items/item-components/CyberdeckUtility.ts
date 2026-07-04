type CyberdeckUtilitySchema = {
  name: StringField;
  rating: NumberField;
  size: NumberField;
  type: StringField;
  active: BooleanField;
};

export default class CyberdeckUtilityModel extends foundry.abstract.DataModel<CyberdeckUtilitySchema> {
  static defineSchema(): CyberdeckUtilitySchema {
    return {
      name: new StringField({ required: true, initial: "" }),
      rating: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      size: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      type: new StringField({ required: true, initial: "operational" }),
      active: new BooleanField({ required: true, initial: false }),
    };
  }
}
