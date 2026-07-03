export default class TransactionModel extends foundry.abstract.TypeDataModel<
  TransactionSchema,
  BaseItem
> {
  static defineSchema(): TransactionSchema {
    return {
      amount: new NumberField({
        required: true,
        initial: 0.0,
      }),
      recurrent: new BooleanField({
        required: true,
        initial: false,
      }),
      isCreditStick: new BooleanField({
        required: true,
        initial: false,
      }),
      type: new StringField({
        required: true,
        initial: "",
      }),
      creditorId: new StringField({
        required: false,
        initial: "",
      }),
      interestPerMonth: new NumberField({
        required: true,
        initial: 0.0,
      }),
      journalId: new StringField({
        required: true,
        initial: "",
      }),
      paidThroughPeriod: new StringField({
        required: false,
        initial: "",
      }),
      lastMissedPeriod: new StringField({
        required: false,
        initial: "",
      }),
      lastInterestPeriod: new StringField({
        required: false,
        initial: "",
      }),
      originalAmount: new NumberField({
        required: false,
        initial: 0.0,
      }),
    };
  }
}

type TransactionSchema = {
  amount: NumberField;
  recurrent: BooleanField;
  isCreditStick: BooleanField;
  type: StringField;
  creditorId: StringField;
  interestPerMonth: NumberField;
  journalId: StringField;
  paidThroughPeriod: StringField;
  lastMissedPeriod: StringField;
  lastInterestPeriod: StringField;
  originalAmount: NumberField;
};
