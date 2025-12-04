export default class MagicModel extends foundry.abstract.TypeDataModel<MagicSchema, BaseItem> {
  static defineSchema(): MagicSchema {
    return {
      awakened: new SchemaField({
        archetype: new StringField({
          required: false,
          initial: "",
        }),
        priority: new StringField({
          required: false,
          initial: "",
        }),
      }),
      magicianData: new SchemaField({
        magicianType: new StringField({
          required: false,
          initial: "",
        }),
        tradition: new StringField({
          required: false,
          initial: "",
        }),
        drainResistanceAttribute: new StringField({
          required: false,
          initial: "",
        }),
        aspect: new StringField({
          required: false,
          initial: "",
        }),
        canAstrallyProject: new BooleanField({
          required: false,
          initial: false,
        }),
        totem: new StringField({
          required: false,
          initial: "",
        }),
        spellPoints: new NumberField({
          required: false,
          initial: 0,
        }),
      }),
      adeptData: new SchemaField({
        powerPoints: new NumberField({
          required: false,
          initial: 0,
        }),
      }),
    };
  }
}

type AwakenedSchema = {
  archetype: StringField;
  priority: StringField;
};

type MagicianDataSchema = {
  magicianType: StringField;
  tradition: StringField;
  drainResistanceAttribute: StringField;
  aspect: StringField;
  canAstrallyProject: BooleanField;
  totem: StringField;
  spellPoints: NumberField;
};

type AdeptDataSchema = {
  powerPoints: NumberField;
};

type MagicSchema = {
  awakened: SchemaField<AwakenedSchema>;
  magicianData: SchemaField<MagicianDataSchema>;
  adeptData: SchemaField<AdeptDataSchema>;
};