type BroadcasterSchema = {
  preparedNews: ArrayField<StringField>;
  rollingNews: ArrayField<StringField>;
  isBroadcasting: BooleanField;
  journalId: StringField;
};

export default class BroadcasterModel extends foundry.abstract.TypeDataModel<
  BroadcasterSchema,
  BaseActor
> {
  static defineSchema(): BroadcasterSchema {
    return {
      preparedNews: new ArrayField(new StringField(), {
        initial: [],
        required: true,
      }),
      rollingNews: new ArrayField(new StringField(), {
        initial: [],
        required: true,
      }),
      isBroadcasting: new BooleanField({
        required: true,
        initial: false,
      }),
      journalId: new StringField({
        required: true,
        initial: "",
      }),
    };
  }
}
