import CommodityModel from "./item-components/Commodity";
import PortabilityModel from "./item-components/Portability";

export default class FocusModel extends foundry.abstract.TypeDataModel<FocusSchema, BaseItem> {
  static defineSchema(): FocusSchema {
    return {
      focusType: new StringField({
        required: true,
        initial: "",
      }),
      force: new NumberField({
        required: true,
        initial: 0,
        integer: true,
      }),
      bonded: new BooleanField({
        required: true,
        initial: false,
      }),
      active: new BooleanField({
        required: true,
        initial: false,
      }),
      scope: new SchemaField({
        spellItemId: new StringField({
          required: true,
          initial: "",
        }),
        category: new StringField({
          required: true,
          initial: "",
        }),
        spiritType: new StringField({
          required: true,
          initial: "",
        }),
      }),
      weapon: new SchemaField({
        reach: new NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
      }),
      dice: new SchemaField({
        spent: new NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
      }),
      // An expendable focus (e.g. a single-use fetish-style talisman) is
      // consumed by use rather than recharging each Combat Turn like a
      // normal bonded focus — registerPoolRefreshHook skips these.
      expendable: new BooleanField({
        required: true,
        initial: false,
      }),
      portability: new EmbeddedDataField(PortabilityModel),
      commodity: new EmbeddedDataField(CommodityModel),
    };
  }
}

type FocusSchema = {
  focusType: StringField;
  force: NumberField;
  bonded: BooleanField;
  active: BooleanField;
  scope: SchemaField<{
    spellItemId: StringField;
    category: StringField;
    spiritType: StringField;
  }>;
  weapon: SchemaField<{
    reach: NumberField;
  }>;
  dice: SchemaField<{
    spent: NumberField;
  }>;
  expendable: BooleanField;
  portability: EmbeddedDataField<typeof PortabilityModel>;
  commodity: EmbeddedDataField<typeof CommodityModel>;
};
