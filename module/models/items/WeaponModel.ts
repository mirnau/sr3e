import CommodityModel from "./item-components/Commodity";
import PortabilityModel from "./item-components/Portability";
import RangeBandModel from "./item-components/RangeBand";
import RollDataModel from "./item-components/RollData";
import { modifiableNumber } from "../common/modifiableNumber";
import ModifiableNumberModel from "./item-components/ModifiableNumber";

type WeaponSchema = {
  mode: StringField;
  ammunitionClass: StringField;
  damage: EmbeddedDataField<typeof ModifiableNumberModel>;
  damageType: StringField;
  shotsPerRound: NumberField;
  reach: NumberField;
  range: EmbeddedDataField<typeof ModifiableNumberModel>;
  recoilComp: EmbeddedDataField<typeof ModifiableNumberModel>;
  reloadMechanism: StringField;
  linkedSkillId: StringField;
  journalId: StringField;
  ammoId: StringField;
  isDefaulting: BooleanField;
  rangeBand: EmbeddedDataField<typeof RangeBandModel>;
  roll: EmbeddedDataField<typeof RollDataModel>;
  portability: EmbeddedDataField<typeof PortabilityModel>;
  commodity: EmbeddedDataField<typeof CommodityModel>;
};

export default class WeaponModel extends foundry.abstract.TypeDataModel<WeaponSchema, BaseItem> {
  static migrateData(source: Record<string, unknown>): Record<string, unknown> {
    source.damage = modifiableNumber(source.damage);
    source.range = modifiableNumber(source.range);
    source.recoilComp = modifiableNumber(source.recoilComp);
    return (foundry.abstract.TypeDataModel as any).migrateData.call(this, source);
  }

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
      damage: new EmbeddedDataField(ModifiableNumberModel),
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
      range: new EmbeddedDataField(ModifiableNumberModel),
      recoilComp: new EmbeddedDataField(ModifiableNumberModel),
      reloadMechanism: new StringField({
        required: true,
        initial: "",
      }),
      linkedSkillId: new StringField({
        required: true,
        initial: "",
      }),
      journalId: new StringField({
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
