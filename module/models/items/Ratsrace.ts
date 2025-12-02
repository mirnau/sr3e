import TransactionModel from "./TransactionModel";

type RatsraceSchema = {
  assets: ArrayField<EmbeddedDataField<typeof TransactionModel>>;
  expeses: ArrayField<EmbeddedDataField<typeof TransactionModel>>;
};

export default class Ratsrace extends TypeDataModel<
  RatsraceSchema,
  BaseItem
> {
  static defineSchema(): RatsraceSchema {
    const transaction = () => new EmbeddedDataField(TransactionModel);
    return {
      assets: new ArrayField(transaction(), {
        required: true,
        initial: [],
      }),
      expeses: new ArrayField(transaction(), {
        required: true,
        initial: [],
      }),
    };
  }
}
