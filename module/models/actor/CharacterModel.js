import Profile from "./components/Profile.js";
import Attributes from "./components/Attributes.js";
import Creation from "./components/Creation.js";
import KarmaModel from "./components/Karma.js";
import HealthModel from "./components/Health.js";

export default class CharacterModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      attributes: new foundry.data.fields.SchemaField(Attributes.defineSchema()),
      profile: new foundry.data.fields.SchemaField(Profile.defineSchema()),
      creation: new foundry.data.fields.SchemaField(Creation.defineSchema()),
      karma: new foundry.data.fields.SchemaField(KarmaModel.defineSchema()),
      health: new foundry.data.fields.SchemaField(HealthModel.defineSchema()),
      journalEntryUuid: new foundry.data.fields.StringField({
        required: false,
        initial: "",
      }),
    };
  }
}