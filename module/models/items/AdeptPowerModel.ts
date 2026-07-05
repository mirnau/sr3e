export default class AdeptPowerModel extends foundry.abstract.TypeDataModel<AdeptPowerSchema, BaseItem> {
  static defineSchema(): AdeptPowerSchema {
    return {
      isActive: new BooleanField({
        required: true,
        initial: false,
      }),
      hasDrain: new BooleanField({
        required: true,
        initial: false,
      }),
      powerPointCost: new NumberField({
        required: true,
        initial: 0,
      }),
      rating: new NumberField({
        required: true,
        initial: 0,
        integer: true,
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
    };
  }
}

type TnModifierEntry = {
  targetKind: StringField;
  targetId: StringField;
  modifier: NumberField;
};

type AdeptPowerSchema = {
  isActive: BooleanField;
  hasDrain: BooleanField;
  powerPointCost: NumberField;
  rating: NumberField;
  tnModifiers: ArrayField<SchemaField<TnModifierEntry>>;
};
