export default class TransactionModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      amount: new foundry.data.fields.NumberField({ 
        required: true,
        initial: 0.0,
      }),
      recurrent: new foundry.data.fields.BooleanField({ //Expose
        required: true,
        initial: false,
      }),
      isCreditStick: new foundry.data.fields.BooleanField({ //Expose
        required: true,
        initial: false,
      }),
      type: new foundry.data.fields.StringField({ //Expose, is a select with Asset, Debt, Expense as options will be localized later
        required: true,
        initial: "",
      }),
      creditorId: new foundry.data.fields.StringField({ // If it is a debt, who is owed to, not exposed
        required: false,
        initial: "",
      }),
      interestPerMonth: new foundry.data.fields.NumberField({ //Expose
        required: true,
        initial: 0.0,
      }),
      journalId: new foundry.data.fields.StringField({ //Exposed already
        required: true,
        initial: "",
      }),
    };
  }
}