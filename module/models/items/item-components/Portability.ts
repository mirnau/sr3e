type PortabilitySchema = {
  conceal: NumberField;
  weight: NumberField;
};

export default class PortabilityModel extends foundry.abstract.DataModel<PortabilitySchema> {
  static defineSchema(): PortabilitySchema {
    return {
      conceal: new NumberField({
        required: true,
        initial: 0,
      }),
      weight: new NumberField({
        required: true,
        initial: 0.0,
      }),
    };
  }
}
