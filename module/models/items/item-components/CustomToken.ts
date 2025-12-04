type CustomTokenSchema = {
  width: NumberField;
  height: NumberField;
  texture: StringField;
};

export default class CustomTokenModel extends foundry.abstract.DataModel<CustomTokenSchema, BaseItem> {
  static defineSchema(): CustomTokenSchema {
    return {
      width: new NumberField({
        integer: true,
        min: 1,
        initial: 1,
      }),
      height: new NumberField({
        integer: true,
        min: 1,
        initial: 1,
      }),
      texture: new StringField({
        initial: "",
        blank: true,
      }),
    };
  }
}
