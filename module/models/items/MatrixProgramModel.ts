import CommodityModel from "./item-components/Commodity";
import PortabilityModel from "./item-components/Portability";
import ModifiableNumberModel from "./item-components/ModifiableNumber";

type MatrixProgramSchema = {
  tnModifier: EmbeddedDataField<typeof ModifiableNumberModel>;
  journalId: StringField;
  portability: EmbeddedDataField<typeof PortabilityModel>;
  commodity: EmbeddedDataField<typeof CommodityModel>;
};

export default class MatrixProgramModel extends foundry.abstract.TypeDataModel<
  MatrixProgramSchema,
  BaseItem
> {
  static defineSchema(): MatrixProgramSchema {
    return {
      tnModifier: new EmbeddedDataField(ModifiableNumberModel),
      journalId: new StringField({ required: true, initial: "" }),
      portability: new EmbeddedDataField(PortabilityModel),
      commodity: new EmbeddedDataField(CommodityModel),
    };
  }
}
