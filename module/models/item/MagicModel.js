export default class MagicModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      type: new foundry.data.fields.StringField({
        required: false,
        initial: ""
      }),
      focus: new foundry.data.fields.StringField({
        required: false,
        initial: ""
      }),
      drainResistanceAttribute: new foundry.data.fields.StringField({
        required: false,
        initial: ""
      }),
      totem: new foundry.data.fields.StringField({
        required: false,
        initial: ""
      }),
      priority: new foundry.data.fields.StringField({
        required: false,
        initial: ""
      })
    };
  }
}