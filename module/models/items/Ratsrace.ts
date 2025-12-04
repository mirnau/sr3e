import TransactionModel from "./TransactionModel";

export default class Ratsrace extends foundry.abstract.TypeDataModel<
  RatsraceSchema,
  BaseItem
> {
  static defineSchema(): RatsraceSchema {
    return {
      assets: new ArrayField(new EmbeddedDataField(TransactionModel), {
        required: true,
        initial: [],
      }),
      expeses: new ArrayField(new EmbeddedDataField(TransactionModel), {
        required: true,
        initial: [],
      }),
    };
  }
}

type RatsraceSchema = {
  assets: ArrayField<EmbeddedDataField<typeof TransactionModel>>;
  expeses: ArrayField<EmbeddedDataField<typeof TransactionModel>>;
};