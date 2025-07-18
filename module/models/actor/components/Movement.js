import SimpleStat from "./SimpleStat.js";

export default class AttributesModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      walking: new foundry.data.fields.SchemaField(SimpleStat.defineSchema()),
      running: new foundry.data.fields.SchemaField(SimpleStat.defineSchema()),
    };
  }
}