export default class Profile extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      names: new foundry.data.fields.ArrayField(
        new foundry.data.fields.SchemaField({
          alias: new foundry.data.fields.StringField({
            required: false,
            initial: "",
          }),
        }),
        {
          required: true,
          initial: [],
        }
      ),

      metaHumanity: new foundry.data.fields.StringField({
        required: false,
        initial: "",
      }),

      // Image
      img: new foundry.data.fields.StringField({
        required: false,
        initial: "systems/sr3e/textures/ai-generated/humans.webp",
      }),

      // Pronouns
      pronouns: new foundry.data.fields.StringField({
        required: false,
        initial: "Them/They",
      }),

      // Age
      age: new foundry.data.fields.NumberField({
        required: false,
        initial: 0,
        integer: true,
      }),

      // Weight
      weight: new foundry.data.fields.NumberField({
        required: false,
        initial: 0,
        integer: true,
      }),

      // Height
      height: new foundry.data.fields.NumberField({
        required: false,
        initial: 0,
        integer: true,
      }),

      // Quote
      quote: new foundry.data.fields.StringField({
        required: false,
        initial: "Alea iacta es",
      }),
    };
  }
}