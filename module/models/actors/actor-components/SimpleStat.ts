
export default class SimpleStat extends foundry.abstract.DataModel<SimpleStatSchema, BaseActor> {
  static defineSchema(): SimpleStatSchema {
    return {
      // The User-system interface (original value)
      value: new NumberField({
        required: true,
        initial: 0,
        integer: true,
      }),
      // The AE-system interface
      mod: new NumberField({
        required: true,
        initial: 0,
        integer: true,
      }),
    };
  }
}

type SimpleStatSchema = {
  value: NumberField;
  mod: NumberField;
};
