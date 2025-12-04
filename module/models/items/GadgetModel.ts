import CommodityModel from "./item-components/Commodity";
import PortabilityModel from "./item-components/Portability";

export default class GadgetModel extends foundry.abstract.TypeDataModel<GadgetSchema, BaseItem> {
  static defineSchema(): GadgetSchema {
    return {
      type: new StringField({
        required: true,
        initial: "",
      }),
      portability: new EmbeddedDataField(PortabilityModel),
      commodity: new EmbeddedDataField(CommodityModel),
    };
  }
}

type GadgetSchema = {
  type: StringField;
  portability: EmbeddedDataField<typeof PortabilityModel>;
  commodity: EmbeddedDataField<typeof CommodityModel>;
};
