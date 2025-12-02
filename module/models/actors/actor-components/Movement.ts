import SimpleStat from "./SimpleStat";

type MovementSchema = {
  walking: EmbeddedDataField<typeof SimpleStat>;
  running: EmbeddedDataField<typeof SimpleStat>;
};

export default class MovementModel extends TypeDataModel<
  MovementSchema,
  BaseActor
> {
  static defineSchema(): MovementSchema {
    return {
      walking: new EmbeddedDataField(SimpleStat),
      running: new EmbeddedDataField(SimpleStat),
    };
  }
}
