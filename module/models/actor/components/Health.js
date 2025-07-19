export default class HealthModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      stun: new foundry.data.fields.NumberField({
        required: true,
        initial: 0,
        integer: true,
        min: 0,
        max: 10,
      }),
      physical: new foundry.data.fields.NumberField({
        required: true,
        initial: 0,
        integer: true,
        min: 0,
        max: 10,
      }),
      overflow: new foundry.data.fields.NumberField({
        required: true,
        initial: 0,
        integer: true,
      }),
      penalty: new foundry.data.fields.NumberField({
        required: true,
        initial: 0,
        integer: true,
      }),
    };
  }
}
