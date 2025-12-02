export default class KarmaModel extends TypeDataModel<KarmaSchema, BaseItem> {
  static defineSchema(): KarmaSchema {
    return {
      value: new NumberField({
        required: true,
        initial: 0,
        integer: true,
      }),
    };
  }
}

type KarmaSchema = {
  value: NumberField;
};