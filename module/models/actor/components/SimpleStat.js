export default class SimpleStat extends foundry.abstract.TypeDataModel {
    static defineSchema() {
      return {
        // The User-system inteface (original value)
        value: new foundry.data.fields.NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
        // The AE-system inteface
        mod: new foundry.data.fields.NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
      };
    }
  }