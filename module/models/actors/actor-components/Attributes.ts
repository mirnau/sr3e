import SimpleStat from "./SimpleStat";

export default class AttributesModel extends TypeDataModel<
  AttributesSchema,
  BaseActor
> {
  static defineSchema(): AttributesSchema {
    return {
      body: new EmbeddedDataField(SimpleStat),
      quickness: new EmbeddedDataField(SimpleStat),
      strength: new EmbeddedDataField(SimpleStat),
      charisma: new EmbeddedDataField(SimpleStat),
      intelligence: new EmbeddedDataField(SimpleStat),
      willpower: new EmbeddedDataField(SimpleStat),
      reaction: new EmbeddedDataField(SimpleStat),
      magic: new EmbeddedDataField(SimpleStat),
      essence: new EmbeddedDataField(SimpleStat),
      initiative: new EmbeddedDataField(SimpleStat),
      isBurnedOut: new BooleanField({ initial: false }),
    };
  }
}

type AttributesSchema = {
  body: EmbeddedDataField<typeof SimpleStat>;
  quickness: EmbeddedDataField<typeof SimpleStat>;
  strength: EmbeddedDataField<typeof SimpleStat>;
  charisma: EmbeddedDataField<typeof SimpleStat>;
  intelligence: EmbeddedDataField<typeof SimpleStat>;
  willpower: EmbeddedDataField<typeof SimpleStat>;
  reaction: EmbeddedDataField<typeof SimpleStat>;
  magic: EmbeddedDataField<typeof SimpleStat>;
  essence: EmbeddedDataField<typeof SimpleStat>;
  initiative: EmbeddedDataField<typeof SimpleStat>;
  isBurnedOut: BooleanField;
};