import SimpleStat from "./SimpleStat.js";

export default class HealthModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      stun: new foundry.data.fields.SchemaField(SimpleStat.defineSchema()),
      physical: new foundry.data.fields.SchemaField(SimpleStat.defineSchema()),
      overflow: new foundry.data.fields.SchemaField(SimpleStat.defineSchema()),
      penalty: new foundry.data.fields.SchemaField(SimpleStat.defineSchema()),
      isAlive: new foundry.data.fields.BooleanField({
        required: true,
        initial: true,
      }),
    };
  }
}
