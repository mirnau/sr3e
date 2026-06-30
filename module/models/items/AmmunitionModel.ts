import CommodityModel from "./item-components/Commodity";
import PortabilityModel from "./item-components/Portability";

export default class AmmunitionModel extends foundry.abstract.TypeDataModel<AmmunitionSchema, BaseItem> {
  static migrateData(source: Record<string, unknown>): Record<string, unknown> {
    if (!source.ammunitionClass && source.class) source.ammunitionClass = source.class;
    return super.migrateData(source);
  }

  static defineSchema(): AmmunitionSchema {
    return {
      ammunitionClass: new StringField({
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
  ammunitionClass: StringField;
  type: StringField;
  reloadMechanism: StringField;
  rounds: NumberField;
  maxCapacity: NumberField;
  portability: EmbeddedDataField<typeof PortabilityModel>;
  commodity: EmbeddedDataField<typeof CommodityModel>;
};