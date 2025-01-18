export default class HealthModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      stun: new foundry.data.fields.ArrayField(
        new foundry.data.fields.BooleanField({
          required: true,
        }),
        {
          required: true,
          initial: Array(10).fill(false), // Default to 10 false values
        }
      ),
      physical: new foundry.data.fields.ArrayField(
        new foundry.data.fields.BooleanField({
          required: true,
        }),
        {
          required: true,
          initial: Array(10).fill(false), // Default to 10 false values
        }
      ),
      overflow: new foundry.data.fields.NumberField({
        required: true,
        initial: 0,
        integer: true,
      }),
      penalty: new foundry.data.fields.NumberField({ // Fix the typo here
        required: true,
        initial: 0,
        integer: true,
      }),
    };
  }
}
