export default class KarmaModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
      return {
        value: new foundry.data.fields.NumberField({
          required: true,
          initial: 0,
          integer: true
        })
      };
    }
  }
  