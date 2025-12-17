import SimpleStat from "./SimpleStat";

type MovementSchema = {
  walking: EmbeddedDataField<typeof SimpleStat>;
  running: EmbeddedDataField<typeof SimpleStat>;
};

export default class MovementModel extends foundry.abstract.DataModel<
  MovementSchema
> {
  static defineSchema(): MovementSchema {
    return {
      walking: new EmbeddedDataField(SimpleStat),
      running: new EmbeddedDataField(SimpleStat),
    };
  }
}
