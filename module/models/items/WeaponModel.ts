import CommodityModel from "./item-components/Commodity";
import PortabilityModel from "./item-components/Portability";
import RangeBandModel from "./item-components/RangeBand";
import RollDataModel from "./item-components/RollData";

type WeaponSchema = {
  mode: StringField;
  ammunitionClass: StringField;
  damage: NumberField;
  damageType: StringField;
  shotsPerRound: NumberField;
  reach: NumberField;
  range: NumberField;
  recoilComp: NumberField;
  reloadMechanism: StringField;
  linkedSkillId: StringField;
  ammoId: StringField;
  isDefaulting: BooleanField;
  rangeBand: EmbeddedDataField<typeof RangeBandModel>;
  roll: EmbeddedDataField<typeof RollDataModel>;
  portability: EmbeddedDataField<typeof PortabilityModel>;
  commodity: EmbeddedDataField<typeof CommodityModel>;
};

export default class WeaponModel extends TypeDataModel<WeaponSchema, BaseItem> {
  static defineSchema(): WeaponSchema {
    return {
      mode: new StringField({
        required: true,
        initial: "",
      }),
      ammunitionClass: new StringField({
        required: true,
        initial: "",
      }),
      damage: new NumberField({
        required: true,
        initial: 0,
      }),
      damageType: new StringField({
        required: true,
        initial: "",
      }),
      shotsPerRound: new NumberField({
        required: true,
        initial: 1,
      }),
      reach: new NumberField({
        required: true,
        initial: 0,
        min: 0,
      }),
      range: new NumberField({
        required: true,
        initial: 0,
        integer: true,
      }),
      recoilComp: new NumberField({
        required: true,
        initial: 0.0,
      }),
      reloadMechanism: new StringField({
        required: true,
        initial: "",
      }),
      linkedSkillId: new StringField({
        required: true,
        initial: "",
      }),
      ammoId: new StringField({
        required: true,
        initial: "",
      }),
      isDefaulting: new BooleanField({
        required: true,
        initial: false,
      }),
      rangeBand: new EmbeddedDataField(RangeBandModel),
      roll: new EmbeddedDataField(RollDataModel),
      portability: new EmbeddedDataField(PortabilityModel),
      commodity: new EmbeddedDataField(CommodityModel),
    };
  }
}
