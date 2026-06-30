export default class ModifiableNumberModel extends foundry.abstract.DataModel<ModifiableNumberSchema> {
  static defineSchema(): ModifiableNumberSchema {
    return {
      value: new NumberField({ required: true, initial: 0, integer: true }),
      mod: new NumberField({ required: true, initial: 0, integer: true }),
    };
  }
}

type ModifiableNumberSchema = {
  value: NumberField;
  mod: NumberField;
};
