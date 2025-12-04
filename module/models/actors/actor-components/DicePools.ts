import SimpleStat from "./SimpleStat";

type DicePoolsSchema = {
  combat: EmbeddedDataField<typeof SimpleStat>;
  astral: EmbeddedDataField<typeof SimpleStat>;
  hacking: EmbeddedDataField<typeof SimpleStat>;
  control: EmbeddedDataField<typeof SimpleStat>;
  spell: EmbeddedDataField<typeof SimpleStat>;
};

export default class DicePoolsModel extends foundry.abstract.DataModel<
  DicePoolsSchema,
  BaseActor
> {
  static defineSchema(): DicePoolsSchema {
    return {
      combat: new EmbeddedDataField(SimpleStat),
      astral: new EmbeddedDataField(SimpleStat),
      hacking: new EmbeddedDataField(SimpleStat),
      control: new EmbeddedDataField(SimpleStat),
      spell: new EmbeddedDataField(SimpleStat),
    };
  }
}
