import CommodityModel from "./item-components/Commodity";
import PortabilityModel from "./item-components/Portability";

export default class MedicalModel extends foundry.abstract.TypeDataModel<MedicalSchema, BaseItem> {
  static defineSchema(): MedicalSchema {
    return {
      isReusable: new BooleanField({ required: true, initial: false }),
      rating: new NumberField({ required: true, initial: 1, integer: true, min: 1 }),
      portability: new EmbeddedDataField(PortabilityModel),
      commodity: new EmbeddedDataField(CommodityModel),
    };
  }
}

type MedicalSchema = {
  isReusable: BooleanField;
  rating: NumberField;
  portability: EmbeddedDataField<typeof PortabilityModel>;
  commodity: EmbeddedDataField<typeof CommodityModel>;
};
