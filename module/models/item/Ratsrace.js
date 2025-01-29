import Transaction from './TransactionModel.js';

export default class Ratsrace extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      // Transactions Array
      assets: new foundry.data.fields.ArrayField(
        new foundry.data.fields.SchemaField(Transaction),
        {
          required: true,
          initial: [],
        }
      ),

      expeses: new foundry.data.fields.ArrayField(
        new foundry.data.fields.SchemaField(Transaction),
        {
          required: true,
          initial: [],
        }
      ),
    };
  }
}