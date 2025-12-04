import SimpleStat from "./SimpleStat";

type HealthSchema = {
  stun: EmbeddedDataField<typeof SimpleStat>;
  physical: EmbeddedDataField<typeof SimpleStat>;
  overflow: EmbeddedDataField<typeof SimpleStat>;
  penalty: EmbeddedDataField<typeof SimpleStat>;
  isAlive: BooleanField;
};

export default class HealthModel extends foundry.abstract.DataModel<
  HealthSchema,
  BaseActor
> {
  static defineSchema(): HealthSchema {
    return {
      stun: new EmbeddedDataField(SimpleStat),
      physical: new EmbeddedDataField(SimpleStat),
      overflow: new EmbeddedDataField(SimpleStat),
      penalty: new EmbeddedDataField(SimpleStat),
      isAlive: new BooleanField({
        required: true,
        initial: true,
      }),
    };
  }
}
