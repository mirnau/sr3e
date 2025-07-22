import Profile from "@models/actor/components/Profile.js";
import Attributes from "@models/actor/components/Attributes.js";
import Creation from "@models/actor/components/Creation.js";
import KarmaModel from "@models/actor/components/Karma.js";
import HealthModel from "@models/actor/components/Health.js";
import DicePools from "@models/actor/components/DicePools.js";
import Movement from "@models/actor/components/Movement.js";

export default class CharacterModel extends foundry.abstract.TypeDataModel {
   static defineSchema() {
      return {
         attributes: new foundry.data.fields.SchemaField(Attributes.defineSchema()),
         dicePools: new foundry.data.fields.SchemaField(DicePools.defineSchema()),
         movement: new foundry.data.fields.SchemaField(Movement.defineSchema()),
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
