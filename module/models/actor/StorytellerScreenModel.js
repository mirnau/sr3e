import Profile from "./components/Profile.js";
import Attributes from "./components/Attributes.js";
import Creation from "./components/Creation.js";
import KarmaModel from "./components/Karma.js";
import HealthModel from "./components/Health.js";
import DicePools from "./components/DicePools.js";
import Movement from "./components/Movement.js";

export default class StorytellerScreenModel extends foundry.abstract.TypeDataModel {
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
