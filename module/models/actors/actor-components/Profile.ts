type ProfileSchema = {
  names: ArrayField<SchemaField<{ alias: StringField }>>;
  metaType: StringField;
  age: NumberField;
  weight: NumberField;
  height: NumberField;
  quote: StringField;
  isDetailsOpen: BooleanField;
};

export default class ProfileModel extends foundry.abstract.DataModel<
  ProfileSchema,
  BaseActor
> {
  static defineSchema(): ProfileSchema {
    return {
      names: new ArrayField(
        new SchemaField({
          alias: new StringField({
            required: false,
            initial: "",
          }),
        }),
        {
          required: true,
          initial: [],
        }
      ),
      metaType: new StringField({
        required: false,
        initial: "",
      }),

      age: new NumberField({
        required: false,
        initial: 0,
        integer: true,
      }),
      weight: new NumberField({
        required: false,
        initial: 0,
        integer: true,
      }),

      height: new NumberField({
        required: false,
        initial: 0,
        integer: true,
      }),
      quote: new StringField({
        required: false,
        initial: "Alea iacta es",
      }),

      // Persistent boolean for the panel state
      isDetailsOpen: new BooleanField({
        required: false,
        initial: false,
      }),
    };
  }
}
