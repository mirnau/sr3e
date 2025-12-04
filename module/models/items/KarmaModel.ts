export default class KarmaModel extends foundry.abstract.TypeDataModel<KarmaSchema, BaseItem> {
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