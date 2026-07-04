import CommodityModel from "./item-components/Commodity";
import PortabilityModel from "./item-components/Portability";

type VehicleControlRigSchema = {
  level: NumberField;
  essenceCost: NumberField;
  journalId: StringField;
  portability: EmbeddedDataField<typeof PortabilityModel>;
  commodity: EmbeddedDataField<typeof CommodityModel>;
};

export default class VehicleControlRigModel extends foundry.abstract.TypeDataModel<
  VehicleControlRigSchema,
  BaseItem
> {
  static defineSchema(): VehicleControlRigSchema {
    return {
      level: new NumberField({
        required: true,
        integer: true,
        min: 1,
        max: 3,
        initial: 1,
      }),
      essenceCost: new NumberField({
        required: true,
        initial: 0,
      }),
      journalId: new StringField({
        required: true,
        initial: "",
      }),
      portability: new EmbeddedDataField(PortabilityModel),
      commodity: new EmbeddedDataField(CommodityModel),
    };
  }
}
