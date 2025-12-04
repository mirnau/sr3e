
export default class RangeBandModel extends foundry.abstract.DataModel<RangeBandSchema, BaseItem> {
  static defineSchema(): RangeBandSchema {
    return {
      short: new NumberField({
        required: true,
        initial: 5,
        integer: true,
        min: 0,
      }),
      medium: new NumberField({
        required: true,
        initial: 20,
        integer: true,
        min: 0,
      }),
      long: new NumberField({
        required: true,
        initial: 40,
        integer: true,
        min: 0,
      }),
      extreme: new NumberField({
        required: true,
        initial: 60,
        integer: true,
        min: 0,
      }),
    };
  }
}

type RangeBandSchema = {
  short: NumberField;
  medium: NumberField;
  long: NumberField;
  extreme: NumberField;
};
