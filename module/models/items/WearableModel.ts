import CommodityModel from "./item-components/Commodity";
import PortabilityModel from "./item-components/Portability";

export default class WearableModel extends TypeDataModel<WearableSchema, BaseItem> {
  static defineSchema(): WearableSchema {
    return {
      ballistic: new NumberField({
        required: true,
        initial: 0,
      }),
      impact: new NumberField({
        required: true,
        initial: 0,
      }),
      canLayer: new BooleanField({
        required: true,
        initial: false,
      }),
      portability: new EmbeddedDataField(PortabilityModel),
      commodity: new EmbeddedDataField(CommodityModel),
    };
  }
}

type WearableSchema = {
  ballistic: NumberField;
  impact: NumberField;
  canLayer: BooleanField;
  portability: EmbeddedDataField<typeof PortabilityModel>;
  commodity: EmbeddedDataField<typeof CommodityModel>;
};