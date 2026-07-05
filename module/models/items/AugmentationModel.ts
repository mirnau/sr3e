import CommodityModel from "./item-components/Commodity";
import PortabilityModel from "./item-components/Portability";

export default class AugmentationModel extends foundry.abstract.TypeDataModel<AugmentationSchema, BaseItem> {
  static defineSchema(): AugmentationSchema {
    return {
      category: new StringField({
        required: true,
        initial: "cyberware",
      }),
      essenceCost: new NumberField({
        required: true,
        initial: 0,
      }),
      tnModifiers: new ArrayField(new SchemaField({
        targetKind: new StringField({
          required: true,
          initial: "skill",
        }),
        targetId: new StringField({
          required: true,
          initial: "",
        }),
        modifier: new NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
      })),
      portability: new EmbeddedDataField(PortabilityModel),
      commodity: new EmbeddedDataField(CommodityModel),
    };
  }
}

type TnModifierEntry = {
  targetKind: StringField;
  targetId: StringField;
  modifier: NumberField;
};

type AugmentationSchema = {
  category: StringField;
  essenceCost: NumberField;
  tnModifiers: ArrayField<SchemaField<TnModifierEntry>>;
  portability: EmbeddedDataField<typeof PortabilityModel>;
  commodity: EmbeddedDataField<typeof CommodityModel>;
};
