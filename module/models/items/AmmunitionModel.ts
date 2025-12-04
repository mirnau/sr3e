import CommodityModel from "./item-components/Commodity";
import PortabilityModel from "./item-components/Portability";

export default class AmmunitionModel extends foundry.abstract.TypeDataModel<AmmunitionSchema, BaseItem> {
  static defineSchema(): AmmunitionSchema {
    return {
      class: new StringField({
        required: true,
        initial: "",
      }),
      type: new StringField({
        required: true,
        initial: "",
      }),
      reloadMechanism: new StringField({
        required: true,
        initial: "",
      }),
      rounds: new NumberField({
        required: true,
        initial: 10,
        integer: true,
      }),
      maxCapacity: new NumberField({
        required: true,
        initial: 10,
        integer: true,
      }),
      portability: new EmbeddedDataField(PortabilityModel),
      commodity: new EmbeddedDataField(CommodityModel),
    };
  }
}

type AmmunitionSchema = {
  class: StringField;
  type: StringField;
  reloadMechanism: StringField;
  rounds: NumberField;
  maxCapacity: NumberField;
  portability: EmbeddedDataField<typeof PortabilityModel>;
  commodity: EmbeddedDataField<typeof CommodityModel>;
};