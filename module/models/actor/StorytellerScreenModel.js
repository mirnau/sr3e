export default class StorytellerScreenModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            journalEntryUuid: new foundry.data.fields.StringField({
                required: false,
                initial: "",
            }),
        };
    }
}
