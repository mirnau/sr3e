type GameMasterScreenSchema = {
  journalEntryUuid: StringField;
};

export default class GameMasterScreenModel extends foundry.abstract.TypeDataModel<
  GameMasterScreenSchema,
  BaseActor
> {
  static defineSchema(): GameMasterScreenSchema {
    return {
      journalEntryUuid: new foundry.data.fields.StringField({
        required: false,
        initial: "",
      }),
    };
  }
}
