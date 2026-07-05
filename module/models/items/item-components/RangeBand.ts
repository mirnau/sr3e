import ModifiableNumberModel from "./ModifiableNumber";

export default class RangeBandModel extends foundry.abstract.DataModel<RangeBandSchema> {
  static defineSchema(): RangeBandSchema {
    return {
      short: new EmbeddedDataField(ModifiableNumberModel),
      medium: new EmbeddedDataField(ModifiableNumberModel),
      long: new EmbeddedDataField(ModifiableNumberModel),
      extreme: new EmbeddedDataField(ModifiableNumberModel),
    };
  }
}

type RangeBandSchema = {
  short: EmbeddedDataField<typeof ModifiableNumberModel>;
  medium: EmbeddedDataField<typeof ModifiableNumberModel>;
  long: EmbeddedDataField<typeof ModifiableNumberModel>;
  extreme: EmbeddedDataField<typeof ModifiableNumberModel>;
};
