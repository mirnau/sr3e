import { modifiableNumber } from "../../common/modifiableNumber";
import ModifiableNumberModel from "./ModifiableNumber";

export default class RangeBandModel extends foundry.abstract.DataModel<RangeBandSchema> {
  static migrateData(source: Record<string, unknown>): Record<string, unknown> {
    source.short = modifiableNumber(source.short, 5);
    source.medium = modifiableNumber(source.medium, 20);
    source.long = modifiableNumber(source.long, 40);
    source.extreme = modifiableNumber(source.extreme, 60);
    return (super.migrateData as (data: Record<string, unknown>) => Record<string, unknown>)(source);
  }

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
