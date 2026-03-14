type StorytellerScreenSchema = {
  journalEntryUuid: StringField;
};

export default class StorytellerScreenModel extends foundry.abstract.TypeDataModel<
  StorytellerScreenSchema,
  BaseActor
> {
  static defineSchema(): StorytellerScreenSchema {
    return {
      journalEntryUuid: new foundry.data.fields.StringField({
        required: false,
        initial: "",
      }),
    };
  }
}
